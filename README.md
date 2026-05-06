### MindFit - Physical and Mental Health Tracking Application

### Installation & Setup

Option 1: Clone with Git

```bash
git clone https://github.com/Sathavan18/MindFit.git
cd MindFit
```

Option 2: Download ZIP

1. Click the green **"Code"** button above
2. Select **"Download ZIP"**
3. Extract the ZIP file
4. Open the extracted folder in your terminal/command prompt

### Backend Setup

1. **Create a virtual environment:**

```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # Mac/Linux
   python3 -m venv venv
   source venv/bin/activate
```
### Backend Setup

1. **Create a virtual environment:**

```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # Mac/Linux
   python3 -m venv venv
   source venv/bin/activate
```

3. **Run database migrations:**

```bash
   python manage.py migrate
```

4. **(Optional) Create a superuser for admin access:**

```bash
   python manage.py createsuperuser
```

5. **Start the Django development server:**

```bash
   python manage.py runserver
```

   The backend API will be available at `http://127.0.0.1:8000/`

---
### Frontend Setup

Open a **new terminal window** (keep the backend running) and navigate to the frontend directory:

1. **Navigate to frontend folder:**

```bash
   cd frontend
```

2. **Install Node dependencies:**

```bash
   npm install
```

3. **Start the React development server:**

```bash
   npm start
```

   The application will automatically open in your browser at `http://localhost:3000/`, you can use the app as desired

---
