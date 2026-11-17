

const lessons = [
  {
    title: "01｜Python 基礎輸出",
    description: "學習使用 print() 將文字顯示在畫面上。",
    concept: "print() 是 Python 的內建函式。字串通常要放在引號中，括號也必須成對。",
    code: 'print("Hello, Python!")',
    expected: "Hello, Python!"
  },
  {
    title: "02｜建立類別與物件",
    description: "認識 class 與 object，建立第一個 Python 物件。",
    concept: "class 用來定義類別；Cat() 會建立物件。pass 表示暫時不執行任何動作。",
    code: [
      "class Cat:",
      "    pass",
      "",
      "cat = Cat()",
      "print(type(cat).__name__)"
    ].join("\n"),
    expected: "Cat"
  },
  {
    title: "03｜建構子與屬性",
    description: "使用 __init__ 建立物件的屬性。",
    concept: "__init__ 是初始化方法，建立物件時會自動呼叫。self.name 代表物件自己的 name 屬性。",
    code: [
      "class Cat:",
      "    def __init__(self, name):",
      "        self.name = name",
      "",
      'cat = Cat("Mimi")',
      "print(cat.name)"
    ].join("\n"),
    expected: "Mimi"
  },
  {
    title: "04｜建立物件方法",
    description: "學習在類別中建立方法，讓物件執行動作。",
    concept: "def 可以在類別中定義方法。使用 return 回傳結果，再透過物件呼叫該方法。",
    code: [
      "class Cat:",
      "    def __init__(self, name):",
      "        self.name = name",
      "",
      "    def meow(self):",
      '        return self.name + " says meow"',
      "",
      'cat = Cat("Mimi")',
      "print(cat.meow())"
    ].join("\n"),
    expected: "Mimi says meow"
  },
  {
    title: "05｜類別繼承",
    description: "理解繼承與方法覆寫。",
    concept: "Dog(Animal) 表示 Dog 繼承 Animal。子類別可以重新定義同名方法，稱為方法覆寫（Method Overriding）。",
    code: [
      "class Animal:",
      "    def speak(self):",
      '        return "sound"',
      "",
      "class Dog(Animal):",
      "    def speak(self):",
      '        return "woof"',
      "",
      "dog = Dog()",
      "print(dog.speak())"
    ].join("\n"),
    expected: "woof"
  }
];

const editor = document.getElementById("codeEditor");
const reference = document.getElementById("referenceCode");
const feedback = document.getElementById("feedback");
const progressFill = document.getElementById("progressFill");
const progressPercent = document.getElementById("progressPercent");
const terminal = document.getElementById("terminal");
const runtimeStatus = document.getElementById("runtimeStatus");
const lessonList = document.getElementById("lessonList");
const nextButton = document.getElementById("nextButton");
const runButton = document.getElementById("runButton");
const toggleButton = document.getElementById("toggleReference");

let currentLesson = -1;
let drafts = {};
let completed = new Set();
let pythonPromise = null;

// 顯示課程清單
function renderLessonList() {
  lessonList.innerHTML = "";

  lessons.forEach((lesson, index) => {
    const button = document.createElement("button");
    button.className =
      "lesson-item" + (index === currentLesson ? " active" : "");

    const number = document.createElement("span");
    number.className = "lesson-number";
    number.textContent = String(index + 1).padStart(2, "0");

    const name = document.createElement("span");
    name.textContent = lesson.title.split("｜")[1];

    button.append(number, name);

    if (completed.has(index)) {
      const done = document.createElement("span");
      done.className = "done-mark";
      done.textContent = "✓";
      button.append(done);
    }

    button.addEventListener("click", () => loadLesson(index));
    lessonList.append(button);
  });
}

// 切換練習
function loadLesson(index) {
  if (currentLesson >= 0) {
    drafts[currentLesson] = editor.value;
  }

  currentLesson = index;
  const lesson = lessons[index];

  document.getElementById("lessonTitle").textContent = lesson.title;
  document.getElementById("lessonDescription").textContent =
    lesson.description;
  document.getElementById("lessonConcept").textContent = lesson.concept;
  document.getElementById("lessonCounter").textContent =
    `第 ${index + 1} 題，共 ${lessons.length} 題`;

  reference.textContent = lesson.code;
  editor.value = drafts[index] || "";

  reference.classList.remove("hidden");
  toggleButton.textContent = "隱藏範例";

  runtimeStatus.textContent = "尚未執行";
  terminal.textContent =
    `預期輸出：${lesson.expected}\n\n按下「執行 Python」測試程式。`;

  checkCode();
  renderLessonList();
}

// 將特殊字元轉成容易理解的文字
function describeCharacter(char) {
  if (char === undefined) return "程式結尾";
  if (char === " ") return "空白";
  if (char === "\n") return "換行";
  if (char === "\t") return "Tab";
  return `"${char}"`;
}

// 計算錯誤位置
function getPosition(code, index) {
  const before = code.slice(0, index);
  const lines = before.split("\n");

  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1
  };
}

// 即時檢查打字內容
function checkCode() {
  const typed = editor.value.replace(/\r\n/g, "\n");
  const target = lessons[currentLesson].code;

  let index = 0;

  while (
    index < typed.length &&
    index < target.length &&
    typed[index] === target[index]
  ) {
    index++;
  }

  const percentage = Math.round((index / target.length) * 100);

  progressFill.style.width = percentage + "%";
  progressPercent.textContent = percentage + "%";

  if (typed === target) {
    feedback.textContent = "完成！程式碼與範例完全一致。";
    feedback.className = "feedback success";
    completed.add(currentLesson);
    renderLessonList();

  } else if (typed.length === 0) {
    feedback.textContent = "請開始輸入程式碼。";
    feedback.className = "feedback";

  } else if (index < typed.length) {
    const position = getPosition(target, index);

    feedback.textContent =
      `第 ${position.line} 行、第 ${position.column} 個字元不符：` +
      `預期 ${describeCharacter(target[index])}，` +
      `實際輸入 ${describeCharacter(typed[index])}。`;

    feedback.className = "feedback error";

  } else {
    feedback.textContent = "目前輸入正確，繼續完成剩下的程式碼。";
    feedback.className = "feedback";
  }

  nextButton.disabled =
    typed !== target || currentLesson === lessons.length - 1;

  return typed === target;
}

// 打字時即時檢查
editor.addEventListener("input", checkCode);

// Tab 自動輸入四個空白
editor.addEventListener("keydown", (event) => {
  if (event.key === "Tab") {
    event.preventDefault();

    const start = editor.selectionStart;
    const end = editor.selectionEnd;

    editor.setRangeText("    ", start, end, "end");
    checkCode();
  }

  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
    event.preventDefault();
    runPython();
  }
});

// 顯示或隱藏參考程式
toggleButton.addEventListener("click", () => {
  reference.classList.toggle("hidden");

  toggleButton.textContent =
    reference.classList.contains("hidden")
      ? "顯示範例"
      : "隱藏範例";
});

// 顯示錯誤或下一個輸入位置
document.getElementById("hintButton").addEventListener("click", () => {
  const target = lessons[currentLesson].code;
  const typed = editor.value;

  let index = 0;

  while (
    index < typed.length &&
    index < target.length &&
    typed[index] === target[index]
  ) {
    index++;
  }

  if (typed === target) {
    feedback.textContent = "這一題已經完成。";
    feedback.className = "feedback success";
    return;
  }

  const position = getPosition(target, index);

  feedback.textContent =
    `提示：請檢查第 ${position.line} 行、第 ${position.column} 個字元，` +
    `正確內容應為 ${describeCharacter(target[index])}。`;

  feedback.className = "feedback";

  editor.focus();
  editor.setSelectionRange(
    index,
    Math.min(index + 1, typed.length)
  );
});

// 手動檢查答案
document.getElementById("checkButton").addEventListener("click", () => {
  checkCode();
  editor.focus();
});

// 重設目前練習
document.getElementById("resetButton").addEventListener("click", () => {
  editor.value = "";
  drafts[currentLesson] = "";

  terminal.textContent = "程式已重設，請重新輸入。";
  runtimeStatus.textContent = "尚未執行";

  checkCode();
  editor.focus();
});

// 下一題
nextButton.addEventListener("click", () => {
  if (currentLesson < lessons.length - 1 && checkCode()) {
    loadLesson(currentLesson + 1);
  }
});

// 載入真正的 Python 執行環境
async function getPython() {
  if (!pythonPromise) {
    if (typeof loadPyodide !== "function") {
      throw new Error("Python 執行引擎未載入，請確認網路連線。");
    }

    pythonPromise = loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/"
    }).catch(error => {
      pythonPromise = null;
      throw error;
    });
  }

  return pythonPromise;
}

// 執行使用者輸入的 Python 程式
async function runPython() {
  const code = editor.value;

  if (!code.trim()) {
    terminal.textContent = "請先輸入 Python 程式碼。";
    return;
  }

  runButton.disabled = true;
  runtimeStatus.textContent = "載入或執行中...";
  terminal.textContent = "正在準備 Python 執行環境...";

  try {
    const pyodide = await getPython();
    const outputLines = [];

    pyodide.setStdout({
      batched: text => outputLines.push(text)
    });

    pyodide.setStderr({
      batched: text => outputLines.push(text)
    });

    await pyodide.runPythonAsync(code, {
      filename: "practice.py",
      dedent: false
    });

    terminal.textContent =
      outputLines.join("\n") ||
      "程式執行成功，但沒有 print() 輸出。";

    runtimeStatus.textContent = "執行成功";

  } catch (error) {
    terminal.textContent = String(error.message || error);
    runtimeStatus.textContent = "執行失敗，請檢查錯誤";
  } finally {
    runButton.disabled = false;
  }
}

runButton.addEventListener("click", runPython);

// 開啟第一題
loadLesson(0);
