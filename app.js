(() => {
  const STORAGE_KEY = "self-lab-strength-exploration-v1";
  const { dimensions, questions } = window.TEST_DATA;
  const dimensionLookup = Object.fromEntries(dimensions.map((item) => [item.id, item]));

  const screens = {
    landing: document.getElementById("landingScreen"),
    test: document.getElementById("testScreen"),
    result: document.getElementById("resultScreen"),
  };

  const elements = {
    brandHome: document.getElementById("brandHome"),
    startBtn: document.getElementById("startBtn"),
    viewLastBtn: document.getElementById("viewLastBtn"),
    resumeNote: document.getElementById("resumeNote"),
    exitTestBtn: document.getElementById("exitTestBtn"),
    progressCount: document.getElementById("progressCount"),
    progressTrack: document.getElementById("progressTrack"),
    progressFill: document.getElementById("progressFill"),
    questionIndex: document.getElementById("questionIndex"),
    questionTitle: document.getElementById("questionTitle"),
    questionCard: document.querySelector(".question-card"),
    options: document.getElementById("options"),
    prevBtn: document.getElementById("prevBtn"),
    nextBtn: document.getElementById("nextBtn"),
    resultTitle: document.getElementById("resultTitle"),
    resultDate: document.getElementById("resultDate"),
    archetypeTitle: document.getElementById("archetypeTitle"),
    archetypeSubtitle: document.getElementById("archetypeSubtitle"),
    archetypeText: document.getElementById("archetypeText"),
    topTraits: document.getElementById("topTraits"),
    radarChart: document.getElementById("radarChart"),
    dimensionGrid: document.getElementById("dimensionGrid"),
    actionList: document.getElementById("actionList"),
    shareBtn: document.getElementById("shareBtn"),
    retakeBtn: document.getElementById("retakeBtn"),
    resultHomeBtn: document.getElementById("resultHomeBtn"),
    toast: document.getElementById("toast"),
  };

  let state = {
    current: 0,
    answers: {},
    completedAt: null,
  };
  let latestResults = null;
  let toastTimer = null;

  function readStorage() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!stored || typeof stored !== "object") return null;
      return {
        current: Number.isInteger(stored.current)
          ? Math.max(0, Math.min(questions.length - 1, stored.current))
          : 0,
        answers:
          stored.answers && typeof stored.answers === "object" ? stored.answers : {},
        completedAt: typeof stored.completedAt === "string" ? stored.completedAt : null,
      };
    } catch {
      return null;
    }
  }

  function writeStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // The test still works if storage is unavailable.
    }
  }

  function answeredCount() {
    return questions.filter((_, index) => Number.isInteger(state.answers[index])).length;
  }

  function isComplete() {
    return answeredCount() === questions.length;
  }

  function showScreen(name) {
    Object.entries(screens).forEach(([screenName, screen]) => {
      screen.hidden = screenName !== name;
    });
    document.body.dataset.screen = name;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function refreshLanding() {
    const count = answeredCount();
    const hasSavedResult = Boolean(state.completedAt) && isComplete();
    elements.viewLastBtn.hidden = !hasSavedResult;

    if (hasSavedResult) {
      elements.startBtn.innerHTML =
        "重新探索 <span class=\"button-arrow\" aria-hidden=\"true\">↗</span>";
      elements.resumeNote.textContent = "上次已经完成。你也可以从第一题重新开始。";
    } else if (count === questions.length) {
      elements.startBtn.innerHTML =
        "查看结果 <span class=\"button-arrow\" aria-hidden=\"true\">↗</span>";
      elements.resumeNote.textContent = "24 道题已经完成，可以生成结果了。";
    } else if (count > 0) {
      elements.startBtn.innerHTML =
        "继续探索 <span class=\"button-arrow\" aria-hidden=\"true\">↗</span>";
      elements.resumeNote.textContent = `已保存 ${count} 道题，答案不会离开这台设备。`;
    } else {
      elements.startBtn.innerHTML =
        "开始探索 <span class=\"button-arrow\" aria-hidden=\"true\">↗</span>";
      elements.resumeNote.textContent = "";
    }
  }

  function startTest({ restart = false } = {}) {
    if (restart) {
      state = { current: 0, answers: {}, completedAt: null };
      writeStorage();
    } else if (state.completedAt) {
      state = { current: 0, answers: {}, completedAt: null };
      writeStorage();
    } else {
      const firstUnanswered = questions.findIndex(
        (_, index) => !Number.isInteger(state.answers[index]),
      );
      state.current = firstUnanswered === -1 ? 0 : firstUnanswered;
    }
    showScreen("test");
    renderQuestion();
  }

  function renderQuestion() {
    const question = questions[state.current];
    const selectedIndex = state.answers[state.current];
    const questionNumber = state.current + 1;
    const progress = (questionNumber / questions.length) * 100;

    elements.questionCard.classList.remove("is-changing");
    void elements.questionCard.offsetWidth;
    elements.questionCard.classList.add("is-changing");

    elements.questionIndex.textContent = String(questionNumber).padStart(2, "0");
    elements.questionTitle.textContent = question.prompt;
    elements.progressCount.textContent = `${String(questionNumber).padStart(2, "0")} / ${questions.length}`;
    elements.progressTrack.setAttribute("aria-valuenow", String(questionNumber));
    elements.progressFill.style.width = `${progress}%`;
    elements.prevBtn.disabled = state.current === 0;
    elements.nextBtn.disabled = !Number.isInteger(selectedIndex);
    elements.nextBtn.innerHTML =
      state.current === questions.length - 1
        ? "查看结果 <span class=\"button-arrow\" aria-hidden=\"true\">→</span>"
        : "下一题 <span class=\"button-arrow\" aria-hidden=\"true\">→</span>";

    elements.options.replaceChildren();
    question.options.forEach((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "option-button";
      button.dataset.index = String(index);
      button.setAttribute("aria-pressed", String(selectedIndex === index));
      if (selectedIndex === index) button.classList.add("is-selected");

      const key = document.createElement("span");
      key.className = "option-key";
      key.setAttribute("aria-hidden", "true");
      key.textContent = String.fromCharCode(65 + index);

      const text = document.createElement("span");
      text.className = "option-text";
      text.textContent = option.text;

      button.append(key, text);
      button.addEventListener("click", () => selectAnswer(index));
      elements.options.append(button);
    });
  }

  function selectAnswer(optionIndex) {
    state.answers[state.current] = optionIndex;
    writeStorage();
    renderQuestion();
  }

  function goPrevious() {
    if (state.current === 0) return;
    state.current -= 1;
    writeStorage();
    renderQuestion();
  }

  function goNext() {
    if (!Number.isInteger(state.answers[state.current])) {
      showToast("先选一个更像你的答案");
      return;
    }

    if (state.current === questions.length - 1) {
      finishTest();
      return;
    }

    state.current += 1;
    writeStorage();
    renderQuestion();
  }

  function calculateResults(answers) {
    const raw = Object.fromEntries(dimensions.map((dimension) => [dimension.id, 0]));
    const maximum = Object.fromEntries(dimensions.map((dimension) => [dimension.id, 0]));

    questions.forEach((question, questionIndex) => {
      const questionMax = Object.fromEntries(dimensions.map((dimension) => [dimension.id, 0]));
      question.options.forEach((option) => {
        Object.entries(option.scores).forEach(([dimensionId, value]) => {
          questionMax[dimensionId] = Math.max(questionMax[dimensionId], value);
        });
      });
      Object.entries(questionMax).forEach(([dimensionId, value]) => {
        maximum[dimensionId] += value;
      });

      const selected = question.options[answers[questionIndex]];
      if (selected) {
        Object.entries(selected.scores).forEach(([dimensionId, value]) => {
          raw[dimensionId] += value;
        });
      }
    });

    return dimensions
      .map((dimension) => {
        const percentage = Math.round((raw[dimension.id] / maximum[dimension.id]) * 100);
        return {
          ...dimension,
          raw: raw[dimension.id],
          percentage: Math.max(0, Math.min(100, percentage)),
        };
      })
      .sort((a, b) => b.percentage - a.percentage);
  }

  function finishTest() {
    if (!isComplete()) {
      showToast("还有题目没有完成");
      return;
    }

    state.completedAt = new Date().toISOString();
    writeStorage();
    latestResults = calculateResults(state.answers);
    renderResults(latestResults);
    showScreen("result");
  }

  function scoreLevel(score) {
    if (score >= 68) return "strong";
    if (score >= 38) return "middle";
    return "light";
  }

  function levelLabel(level) {
    return {
      strong: "这条线索在你的选择中很常见",
      middle: "这条线索会在合适情境里出现",
      light: "这条线索可能更依赖特定情境被唤醒",
    }[level];
  }

  function renderResults(results) {
    const top = results[0];
    const topThree = results.slice(0, 3);
    const level = scoreLevel(top.percentage);

    elements.archetypeTitle.textContent = top.archetype;
    elements.archetypeSubtitle.textContent = top.archetypeSubtitle;
    elements.archetypeText.textContent = top[level];
    elements.resultDate.textContent = formatDate(new Date(state.completedAt));

    elements.topTraits.replaceChildren();
    topThree.forEach((item) => {
      const chip = document.createElement("span");
      chip.className = "trait-chip";
      chip.textContent = `${item.name} · ${item.percentage}%`;
      elements.topTraits.append(chip);
    });

    elements.radarChart.innerHTML = buildRadar(results);
    elements.dimensionGrid.replaceChildren();
    results.forEach((result) => {
      const card = document.createElement("article");
      card.className = "dimension-card";

      const head = document.createElement("div");
      head.className = "dimension-head";
      head.innerHTML = `
        <div class="dimension-name">
          <strong>${escapeHtml(result.name)}</strong>
          <span>${escapeHtml(result.symbol)}</span>
        </div>
        <span class="dimension-score">${result.percentage}%</span>
      `;

      const track = document.createElement("div");
      track.className = "score-track";
      track.setAttribute("aria-hidden", "true");
      const fill = document.createElement("div");
      fill.className = "score-fill";
      fill.style.width = `${result.percentage}%`;
      track.append(fill);

      const summary = document.createElement("p");
      summary.className = "dimension-summary";
      summary.textContent = result.summary;

      const levelText = document.createElement("p");
      levelText.className = "dimension-level";
      levelText.textContent = levelLabel(scoreLevel(result.percentage));

      card.append(head, track, summary, levelText);
      elements.dimensionGrid.append(card);
    });

    const selectedActions = [
      top.actions[0],
      topThree[1].actions[0],
      topThree[2].actions[0],
    ];
    elements.actionList.replaceChildren();
    selectedActions.forEach((action, index) => {
      const card = document.createElement("article");
      card.className = "action-card";
      card.innerHTML = `<span>0${index + 1}</span><p>${escapeHtml(action)}</p>`;
      elements.actionList.append(card);
    });
  }

  function buildRadar(results) {
    const orderedResults = dimensions.map((dimension) =>
      results.find((result) => result.id === dimension.id),
    );
    const width = 540;
    const height = 450;
    const centerX = 270;
    const centerY = 218;
    const outerRadius = 132;
    const labelRadius = 175;
    const count = orderedResults.length;

    const pointAt = (index, radius) => {
      const angle = -Math.PI / 2 + (index * Math.PI * 2) / count;
      return {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      };
    };

    const rings = [0.25, 0.5, 0.75, 1]
      .map((ratio) => {
        const points = orderedResults
          .map((_, index) => {
            const point = pointAt(index, outerRadius * ratio);
            return `${point.x.toFixed(1)},${point.y.toFixed(1)}`;
          })
          .join(" ");
        return `<polygon class="radar-grid" points="${points}"></polygon>`;
      })
      .join("");

    const axes = orderedResults
      .map((_, index) => {
        const point = pointAt(index, outerRadius);
        return `<line class="radar-axis" x1="${centerX}" y1="${centerY}" x2="${point.x.toFixed(1)}" y2="${point.y.toFixed(1)}"></line>`;
      })
      .join("");

    const valuePoints = orderedResults.map((result, index) => {
      const point = pointAt(index, outerRadius * (result.percentage / 100));
      return { ...point, result };
    });

    const shape = valuePoints
      .map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`)
      .join(" ");

    const labels = orderedResults
      .map((result, index) => {
        const point = pointAt(index, labelRadius);
        const dx = point.x - centerX;
        const dy = point.y - centerY;
        let anchor = "middle";
        if (dx > 35) anchor = "start";
        if (dx < -35) anchor = "end";
        const valueY = point.y + (dy >= 0 ? 18 : -16);
        return `
          <text class="radar-label" x="${point.x.toFixed(1)}" y="${point.y.toFixed(1)}" text-anchor="${anchor}">${escapeHtml(result.name)}</text>
          <text class="radar-value" x="${point.x.toFixed(1)}" y="${valueY.toFixed(1)}" text-anchor="${anchor}">${result.percentage}%</text>
        `;
      })
      .join("");

    const points = valuePoints
      .map(
        (point) => `
          <circle class="radar-point" cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="4">
            <title>${escapeHtml(point.result.name)}：${point.result.percentage}%</title>
          </circle>
        `,
      )
      .join("");

    return `
      <svg class="radar-chart" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="radarTitle radarDesc">
        <title id="radarTitle">八种优势线索雷达图</title>
        <desc id="radarDesc">${orderedResults.map((result) => `${result.name} ${result.percentage}%`).join("，")}</desc>
        ${rings}
        ${axes}
        <polygon class="radar-shape" points="${shape}"></polygon>
        ${points}
        ${labels}
      </svg>
    `;
  }

  function formatDate(date) {
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.append(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      textarea.remove();
      return copied;
    }
  }

  async function shareResult() {
    if (!latestResults) return;
    const top = latestResults.slice(0, 3);
    const summary = `我的隐藏优势探索结果：${top
      .map((item) => `${item.name} ${item.percentage}%`)
      .join("、")}。核心线索是「${top[0].archetype}」。`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "我的优势光谱",
          text: summary,
        });
        return;
      } catch (error) {
        if (error.name === "AbortError") return;
      }
    }

    const copied = await copyText(summary);
    showToast(copied ? "结果摘要已复制" : "暂时无法复制，请手动记录");
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => {
      elements.toast.classList.remove("is-visible");
    }, 2200);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function showSavedResult() {
    if (!isComplete()) return;
    latestResults = calculateResults(state.answers);
    renderResults(latestResults);
    showScreen("result");
  }

  function retake() {
    state = { current: 0, answers: {}, completedAt: null };
    writeStorage();
    showScreen("test");
    renderQuestion();
  }

  function goHome() {
    refreshLanding();
    showScreen("landing");
  }

  elements.startBtn.addEventListener("click", () => {
    if (answeredCount() === questions.length && !state.completedAt) {
      finishTest();
      return;
    }
    const restart = Boolean(state.completedAt) && isComplete();
    startTest({ restart });
  });
  elements.viewLastBtn.addEventListener("click", showSavedResult);
  elements.exitTestBtn.addEventListener("click", goHome);
  elements.prevBtn.addEventListener("click", goPrevious);
  elements.nextBtn.addEventListener("click", goNext);
  elements.shareBtn.addEventListener("click", shareResult);
  elements.retakeBtn.addEventListener("click", retake);
  elements.resultHomeBtn.addEventListener("click", goHome);
  elements.brandHome.addEventListener("click", (event) => {
    event.preventDefault();
    goHome();
  });

  document.addEventListener("keydown", (event) => {
    if (screens.test.hidden || event.metaKey || event.ctrlKey || event.altKey) return;
    if (/^[1-4]$/.test(event.key)) {
      event.preventDefault();
      selectAnswer(Number(event.key) - 1);
    }
    if (event.key === "ArrowRight") goNext();
    if (event.key === "ArrowLeft") goPrevious();
  });

  const stored = readStorage();
  if (stored) state = stored;
  refreshLanding();
  showScreen("landing");
})();
