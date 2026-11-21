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
    shareModal: document.getElementById("shareModal"),
    closeShareBtn: document.getElementById("closeShareBtn"),
    shareImage: document.getElementById("shareImage"),
    shareHint: document.getElementById("shareHint"),
    shareImageActionBtn: document.getElementById("shareImageActionBtn"),
    downloadImageBtn: document.getElementById("downloadImageBtn"),
    toast: document.getElementById("toast"),
  };

  let state = {
    current: 0,
    answers: {},
    completedAt: null,
  };
  let latestResults = null;
  let toastTimer = null;
  let latestShareFile = null;
  let latestShareUrl = null;
  let shareTrigger = null;

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

  function localDateStamp(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function roundedRect(ctx, x, y, width, height, radius) {
    const safeRadius = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + safeRadius, y);
    ctx.arcTo(x + width, y, x + width, y + height, safeRadius);
    ctx.arcTo(x + width, y + height, x, y + height, safeRadius);
    ctx.arcTo(x, y + height, x, y, safeRadius);
    ctx.arcTo(x, y, x + width, y, safeRadius);
    ctx.closePath();
  }

  function wrapCanvasText(ctx, text, maxWidth) {
    const lines = [];
    let line = "";
    for (const character of String(text)) {
      const candidate = line + character;
      if (line && ctx.measureText(candidate).width > maxWidth) {
        lines.push(line);
        line = character;
      } else {
        line = candidate;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function drawCanvasRadar(ctx, results, centerX, centerY, radius) {
    const orderedResults = dimensions.map((dimension) =>
      results.find((result) => result.id === dimension.id),
    );
    const count = orderedResults.length;
    const pointAt = (index, distance) => {
      const angle = -Math.PI / 2 + (index * Math.PI * 2) / count;
      return {
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
      };
    };

    for (const ratio of [0.25, 0.5, 0.75, 1]) {
      ctx.beginPath();
      orderedResults.forEach((_, index) => {
        const point = pointAt(index, radius * ratio);
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.closePath();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    orderedResults.forEach((_, index) => {
      const point = pointAt(index, radius);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(point.x, point.y);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.stroke();
    });

    ctx.beginPath();
    orderedResults.forEach((result, index) => {
      const point = pointAt(index, radius * (result.percentage / 100));
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.closePath();
    ctx.fillStyle = "rgba(210, 226, 122, 0.18)";
    ctx.fill();
    ctx.strokeStyle = "#d2e27a";
    ctx.lineWidth = 3;
    ctx.stroke();

    orderedResults.forEach((result, index) => {
      const point = pointAt(index, radius * (result.percentage / 100));
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = "#d2e27a";
      ctx.fill();
      ctx.strokeStyle = "#1d2a26";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    orderedResults.forEach((result, index) => {
      const point = pointAt(index, radius + 32);
      ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
      ctx.font = '500 17px "Microsoft YaHei", sans-serif';
      ctx.fillText(result.name, point.x, point.y);
    });
  }

  function createShareCard(results) {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1440;
    const ctx = canvas.getContext("2d");
    const top = results[0];
    const topThree = results.slice(0, 3);
    const level = scoreLevel(top.percentage);
    const displayFont = '"Songti SC", "STSong", "SimSun", serif';
    const sansFont = '"Microsoft YaHei", "PingFang SC", sans-serif';

    ctx.fillStyle = "#f3efe4";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(210, 226, 122, 0.23)";
    ctx.beginPath();
    ctx.arc(920, 70, 290, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(228, 87, 67, 0.08)";
    ctx.beginPath();
    ctx.moveTo(820, 130);
    ctx.bezierCurveTo(960, 86, 1120, 210, 1046, 350);
    ctx.bezierCurveTo(988, 462, 836, 401, 827, 305);
    ctx.bezierCurveTo(820, 226, 752, 169, 820, 130);
    ctx.fill();

    ctx.save();
    ctx.translate(72, 76);
    ctx.rotate(-0.16);
    ctx.fillStyle = "#e45743";
    ctx.beginPath();
    ctx.ellipse(10, 0, 17, 25, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1d2a26";
    ctx.beginPath();
    ctx.ellipse(31, 0, 17, 25, 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = "#1d2a26";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.font = `700 42px ${displayFont}`;
    ctx.fillText("一方", 125, 98);
    ctx.fillStyle = "#68716c";
    ctx.font = `600 16px ${sansFont}`;
    ctx.fillText("SELF LAB", 202, 97);

    ctx.textAlign = "right";
    ctx.fillStyle = "#68716c";
    ctx.font = `400 19px ${sansFont}`;
    ctx.fillText(formatDate(new Date(state.completedAt || Date.now())), 1008, 97);

    ctx.textAlign = "left";
    ctx.fillStyle = "#e45743";
    ctx.fillRect(72, 186, 42, 3);
    ctx.fillStyle = "#68716c";
    ctx.font = `600 20px ${sansFont}`;
    ctx.fillText("隐藏优势探索 · 我的结果卡", 132, 196);

    ctx.fillStyle = "#1d2a26";
    ctx.font = `700 84px ${displayFont}`;
    ctx.fillText(top.archetype, 72, 306);

    ctx.fillStyle = "#c94735";
    ctx.font = `400 32px ${displayFont}`;
    ctx.fillText(top.archetypeSubtitle, 72, 362);

    let chipX = 72;
    topThree.forEach((item, index) => {
      const label = `${item.name}  ${item.percentage}%`;
      ctx.font = `600 21px ${sansFont}`;
      const width = ctx.measureText(label).width + 52;
      roundedRect(ctx, chipX, 397, width, 46, 23);
      ctx.fillStyle = index === 0 ? "#d2e27a" : "rgba(255, 253, 247, 0.78)";
      ctx.fill();
      ctx.strokeStyle = index === 0 ? "#d2e27a" : "rgba(29, 42, 38, 0.12)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = "#1d2a26";
      ctx.beginPath();
      ctx.arc(chipX + 22, 420, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText(label, chipX + 36, 428);
      chipX += width + 12;
    });

    roundedRect(ctx, 48, 480, 984, 430, 24);
    ctx.fillStyle = "#1d2a26";
    ctx.fill();

    drawCanvasRadar(ctx, results, 274, 695, 142);

    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = `600 17px ${sansFont}`;
    ctx.fillText("TOP 3 优势线索", 548, 560);

    topThree.forEach((item, index) => {
      const rowY = 614 + index * 92;
      ctx.fillStyle = "#d2e27a";
      ctx.font = `700 20px ${displayFont}`;
      ctx.fillText(`0${index + 1}`, 548, rowY);
      ctx.fillStyle = "#ffffff";
      ctx.font = `500 29px ${sansFont}`;
      ctx.fillText(item.name, 610, rowY + 1);
      ctx.textAlign = "right";
      ctx.fillStyle = index === 0 ? "#d2e27a" : "rgba(255, 255, 255, 0.74)";
      ctx.font = `500 25px ${sansFont}`;
      ctx.fillText(`${item.percentage}%`, 972, rowY + 1);
      ctx.textAlign = "left";

      roundedRect(ctx, 610, rowY + 18, 362, 5, 3);
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.fill();
      roundedRect(
        ctx,
        610,
        rowY + 18,
        Math.max(8, 362 * (item.percentage / 100)),
        5,
        3,
      );
      ctx.fillStyle = index === 0 ? "#d2e27a" : "rgba(255, 255, 255, 0.5)";
      ctx.fill();
    });

    ctx.fillStyle = "#68716c";
    ctx.font = `600 18px ${sansFont}`;
    ctx.fillText("你的核心势能", 72, 1004);

    ctx.fillStyle = "#1d2a26";
    ctx.font = `400 29px ${sansFont}`;
    const narrative = wrapCanvasText(ctx, top[level], 900).slice(0, 4);
    narrative.forEach((line, index) => {
      ctx.fillText(line, 72, 1054 + index * 48);
    });

    const suggestionY = 1054 + narrative.length * 48 + 34;
    roundedRect(ctx, 72, suggestionY, 118, 38, 19);
    ctx.fillStyle = "#e45743";
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = `600 17px ${sansFont}`;
    ctx.fillText("可以试试", 98, suggestionY + 26);

    ctx.fillStyle = "#1d2a26";
    ctx.font = `400 25px ${sansFont}`;
    const suggestion = wrapCanvasText(ctx, top.actions[0], 720).slice(0, 3);
    suggestion.forEach((line, index) => {
      ctx.fillText(line, 218, suggestionY + 26 + index * 40);
    });

    ctx.strokeStyle = "rgba(29, 42, 38, 0.14)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(72, 1351);
    ctx.lineTo(1008, 1351);
    ctx.stroke();

    ctx.fillStyle = "#68716c";
    ctx.font = `500 17px ${sansFont}`;
    ctx.fillText("一方 SELF LAB · 看见自己的用力方式", 72, 1391);
    ctx.textAlign = "right";
    ctx.fillText("非诊断性自我探索", 1008, 1391);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("分享图片生成失败"));
      }, "image/png");
    });
  }

  function releaseShareImage() {
    if (latestShareUrl) URL.revokeObjectURL(latestShareUrl);
    latestShareUrl = null;
    latestShareFile = null;
    elements.shareImage.removeAttribute("src");
  }

  async function shareResultImage() {
    if (!latestResults) return;
    shareTrigger = document.activeElement;
    const originalMarkup = elements.shareBtn.innerHTML;
    elements.shareBtn.disabled = true;
    elements.shareBtn.textContent = "正在生成图片…";
    showToast("正在生成结果图片");

    try {
      const shareBlob = await createShareCard(latestResults);
      releaseShareImage();
      latestShareFile = new File([shareBlob], `一方-隐藏优势-${localDateStamp()}.png`, {
        type: "image/png",
      });
      latestShareUrl = URL.createObjectURL(latestShareFile);
      elements.shareImage.src = latestShareUrl;
      elements.downloadImageBtn.href = latestShareUrl;
      elements.downloadImageBtn.download = latestShareFile.name;

      const canShareFile = Boolean(
        navigator.share &&
          navigator.canShare &&
          navigator.canShare({ files: [latestShareFile] }),
      );
      elements.shareHint.textContent = canShareFile
        ? "可以直接分享图片，也可以保存到设备后发到微信、朋友圈或小红书。"
        : "当前浏览器不支持直接分享图片，可长按下方图片保存，或点击“保存图片”。";
      elements.shareModal.hidden = false;
      document.body.classList.add("has-modal");
      elements.shareImageActionBtn.focus();
    } catch {
      showToast("结果图片生成失败，请重试");
    } finally {
      elements.shareBtn.disabled = false;
      elements.shareBtn.innerHTML = originalMarkup;
    }
  }

  async function shareGeneratedImage() {
    if (!latestShareFile) return;
    const canShareFile = Boolean(
      navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [latestShareFile] }),
    );

    if (canShareFile) {
      try {
        await navigator.share({
          title: "我的隐藏优势结果",
          text: `我的核心优势线索是「${latestResults[0].archetype}」。`,
          files: [latestShareFile],
        });
        return;
      } catch (error) {
        if (error.name === "AbortError") return;
      }
    }

    elements.downloadImageBtn.click();
    showToast("当前浏览器不支持直接分享，图片已开始保存");
  }

  function closeShareDialog() {
    if (elements.shareModal.hidden) return;
    elements.shareModal.hidden = true;
    document.body.classList.remove("has-modal");
    releaseShareImage();
    const target = shareTrigger instanceof HTMLElement ? shareTrigger : elements.shareBtn;
    target.focus();
    shareTrigger = null;
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
  elements.shareBtn.addEventListener("click", shareResultImage);
  elements.shareImageActionBtn.addEventListener("click", shareGeneratedImage);
  elements.closeShareBtn.addEventListener("click", closeShareDialog);
  elements.downloadImageBtn.addEventListener("click", () => {
    showToast("正在保存结果图片");
  });
  elements.shareModal.addEventListener("click", (event) => {
    if (event.target === elements.shareModal) closeShareDialog();
  });
  elements.retakeBtn.addEventListener("click", retake);
  elements.resultHomeBtn.addEventListener("click", goHome);
  elements.brandHome.addEventListener("click", (event) => {
    event.preventDefault();
    goHome();
  });

  document.addEventListener("keydown", (event) => {
    if (!elements.shareModal.hidden) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeShareDialog();
        return;
      }
      if (event.key === "Tab") {
        const focusable = [...elements.shareModal.querySelectorAll("button, a[href]")].filter(
          (element) => !element.hasAttribute("disabled"),
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
      return;
    }
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
