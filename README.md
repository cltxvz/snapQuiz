# **📸 SnapQuiz**  

*"Test your memory with AI-generated quizzes based on random images!"*  

---

## **🚀 Description:**  

**SnapQuiz** is an interactive web application that challenges players to **memorize an image for a few seconds** and then answer **AI-generated multiple-choice questions** about it. This project leverages **Google Gemini AI** to analyze images and create dynamic quizzes.  

### ✅ **How it Works:**  
1) **The app finds a random image online** (Wikimedia Commons).  
2) **You have a few seconds to memorize it.**  
3) **Answer a multiple-choice quiz** about the image.  
4) **Get your score and see correct answers!**  

SnapQuiz is a fun and engaging way to test **visual memory, observation skills, and attention to detail!**  

---

## **🛠️ Technologies Used:**  

### **Frontend (React & UI)**  
- **React.js** – Component-based UI development.  
- **React Router** – Navigation between pages.  
- **Bootstrap 5** – Responsive UI and styling.  
- **Axios** – API calls to the backend.  
- **React Hooks (`useState`, `useEffect`)** – State management.  
- **Heroku** – Deployment.  

### **Backend (Flask & AI Integration)**  
- **Flask** – Lightweight Python backend.  
- **Google Gemini AI Vision** – Image analysis and quiz generation.  
- **BeautifulSoup** – Web scraping to find random images.  
- **Requests** – Fetching images from Wikimedia Commons.  
- **Pillow (PIL)** – Image processing and conversion.  
- **Heroku** – Cloud deployment.  

### **Deployment & Hosting**  
- **Heroku (Frontend + Backend)** – Hosting the full application.  
- **Git & GitHub** – Version control and collaboration.  

---

## **📚 Skills & Concepts Applied:**  

### **Full-Stack Development**  
- **Frontend + Backend Integration** – Connecting React with Flask.  
- **RESTful API Development** – Handling GET/POST requests for images & quizzes.  
- **AI Integration** – Using **Google Gemini Vision AI** to generate custom quizzes.  

### **Software Engineering Best Practices**  
- **Modular Code Structure** – Well-organized frontend & backend.  
- **Error Handling & Debugging** – Handling invalid images, API failures, and retries.  
- **Optimized API Calls** – Efficient **image fetching & quiz generation.**  
- **Environment Variables (`.env`)** – Securing API keys & backend credentials.  

### **AI & Data Processing**  
- **Image Scraping & Filtering** – Using **BeautifulSoup** to select **valid images**.  
- **Image Processing** – Resizing and converting images for AI compatibility.  
- **AI Prompt Engineering** – Crafting effective prompts for **accurate quiz generation**.  

### **UI/UX & Performance Optimization**  
- **Responsive Design** – Mobile-friendly interface with **Bootstrap 5**.  
- **Timers & Animations** – Countdown timers for memorization phase.  
- **Loading States & Status Updates** – Improved user experience with dynamic loading messages.  

---

## **📖 Features & How to Use SnapQuiz:**  

### **Game Flow:**  
- **Click "Start Game"** – The app finds a random image.  
- **Memorize the image** – You have **15 seconds** before it disappears!  
- **Answer the quiz** – AI-generated multiple-choice questions test your memory.  
- **See your final score** – Review answers and improve!  

### **Game Enhancements:**  
- **Dynamic AI Quizzes** – Each game is unique!  
- **Auto-retry on invalid images** – Ensures AI can process the image.  
- **Shuffled Answer Choices** – Prevents pattern-based guessing.  
- **Live Timer** – Helps players track time.  

---

## **📈 Ideas for Future Improvements:**  

- **Different Quiz Modes** – Timed quizzes, difficulty levels, etc.  
- **Leaderboard & Score History** – Compete with friends!  
- **User Accounts & Profiles** – Save scores and progress.  
- **Multiplayer Mode** – Compete live with others!  

---

## **📜 How to Run SnapQuiz Locally:**  

### **1. Clone the Repository:**  
```bash
git clone https://github.com/cltxvz/snapQuiz.git
```

### **2. Install Backend Dependencies:**  
```bash
cd backend
pip install -r requirements.txt
```

### **3. Set Up Environment Variables:**  
Create a `.env` file in the backend folder and add:  
```env
GOOGLE_API_KEY=your-google-gemini-api-key
```

### **4. Start the Backend Server:**  
```bash
python app.py
```
or  
```bash
flask run
```

### **5. Install & Run the Frontend:**  
```bash
cd frontend
npm install
npm start
```
Then, visit:  
```
http://localhost:3000
```

---

## **🌎 Live Demo (Hosted on Heroku)**  
**SnapQuiz:** [https://snapquiz-frontend-489546fcd686.herokuapp.com/](https://snapquiz-frontend-489546fcd686.herokuapp.com/)  

---

## **👤 Author:**  
**Carlos A. Cárdenas**  

🚀 If you found this project fun or useful, **star the repo** and feel free to contribute!  

---

### **✅ Final Notes:**  
This project was built to **demonstrate AI-powered quiz generation**, integrating **computer vision, web scraping, and game mechanics** into a **seamless full-stack experience**.  

Thank you for checking out **SnapQuiz**! 🎯🧠🚀