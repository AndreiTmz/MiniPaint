# 🎨 Mini Paint Application

A lightweight, browser-based drawing tool built using **HTML5 Canvas, CSS, and Vanilla JavaScript**. This project replicates core features of classic paint applications, offering an intuitive interface and real-time drawing capabilities.

## 📌 Overview

The **Mini Paint Application** allows users to draw, erase, and create basic shapes directly in the browser. It is designed to demonstrate fundamental concepts of:

* Canvas API manipulation
* Event-driven programming
* UI/UX interaction design
* Multimedia integration (sound effects)

## 🚀 Features

### 🖌️ Drawing Tools

* **Pencil Tool** – Freehand drawing
* **Eraser Tool** – Remove parts of the drawing
* **Line Tool** – Draw straight lines
* **Rectangle Tool** – Draw rectangles dynamically
* **Ellipse Tool** – Draw circles/ellipses

### 🎛️ Customization

* Adjustable **brush size** (1px – 50px)
* Selectable **color palette**
* Real-time width indicator

### 🔊 Sound Effects

* Interactive sound feedback for:

  * Tool selection
  * Drawing actions
* Toggle sound ON/OFF

### 💾 Canvas Controls

* **Save drawing** as a `.jpg` image
* **Clear canvas** instantly

## 🖼️ UI Layout

The application is divided into three main sections:

* **Left Panel**

  * Tool selection
  * Brush settings (color & width)

* **Center Workspace**

  * HTML5 Canvas drawing area

* **Right Panel**

  * Save and Clear actions

## 🛠️ Technologies Used

* **HTML5** – Structure and Canvas element
* **CSS3** – Layout (Flexbox) and styling
* **JavaScript (Vanilla)** – Application logic and interactivity

## ⚙️ How It Works

* Uses the **Canvas 2D Context API** for rendering shapes and strokes.
* Mouse events (`mousedown`, `mousemove`, `mouseup`) control drawing behavior.
* Canvas state is preserved using `getImageData()` and restored during shape previews.
* Separate logic is implemented for each drawing tool.

## ▶️ Getting Started

1. Clone the repository:

```bash
git clone https://github.com/AndreiTmz/MiniPaint.git
```

2. Navigate to the project folder:

```bash
cd MiniPaint
```

3. Open `index.html` in your browser.

If you encounter the error **"Unsafe attempt to load URL"** in the browser console, it is caused by browser security restrictions when opening files locally.

To resolve this, run a local development server:

```bash
npx serve
```

## 📸 Screenshots


<img width="1919" height="973" alt="image" src="https://github.com/user-attachments/assets/62d066a1-0c32-4ea3-ab5b-a3308c1d42cb" />

## 💡 Future Improvements

* Add undo/redo functionality
* Implement fill (bucket) tool
* Export in multiple formats (PNG, SVG)
* Keyboard shortcuts

## 🧠 Learning Outcomes

* DOM manipulation and event handling
* Canvas rendering techniques
* Managing application state
* Structuring and styling small front-end applications

## 🌐 Live Demo

👉 https://andreitmz.github.io/MiniPaint/


## 📄 License

This project is open-source and available under the **MIT License**.

⭐ If you like this project, consider giving it a star!
