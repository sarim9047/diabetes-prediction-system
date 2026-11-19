# Diabetes Prediction and Health Risk Assessment System

A full-stack web application for diabetes risk screening using machine learning. Built with React (frontend) and FastAPI (backend), featuring a Decision Tree classifier trained on the PIMA Indian Diabetes Dataset.

## 🏥 Project Overview

This system provides an AI-powered screening tool for diabetes risk assessment. It uses clinical biomarkers to predict the likelihood of diabetes and provides educational health guidance. The application is designed for academic demonstration and research purposes.

**⚠️ Medical Disclaimer:** This tool is for educational screening purposes only and does not constitute a medical diagnosis. Always consult a qualified healthcare professional for medical advice.

## 🚀 Features

- **User Authentication:** Secure login/registration with JWT tokens
- **Risk Prediction:** ML-based diabetes risk assessment using 8 clinical parameters
- **Dashboard:** Personal statistics, prediction history, and trend visualization
- **Admin Panel:** System-wide user management and analytics
- **ML Analytics:** Model performance metrics, confusion matrices, ROC curves
- **Health Education:** Educational content on diabetes types, risk factors, and prevention
- **PDF Reports:** Downloadable prediction reports for screening results

## 📋 Tech Stack

### Frontend
- **Framework:** React 18 with Vite
- **Routing:** React Router v6
- **Styling:** TailwindCSS with custom medical-themed palette
- **UI Components:** Lucide React icons, Framer Motion animations
- **Charts:** Recharts for data visualization
- **HTTP Client:** Axios with interceptors for JWT handling

### Backend
- **Framework:** FastAPI (Python 3.9+)
- **Database:** SQLite with SQLAlchemy ORM
- **Authentication:** JWT (python-jose) with bcrypt password hashing
- **ML Library:** scikit-learn for model training and inference
- **PDF Generation:** ReportLab for report generation
- **API Documentation:** Auto-generated Swagger/OpenAPI docs

### Machine Learning
- **Dataset:** PIMA Indian Diabetes Dataset (768 samples, 8 features)
- **Selected Model:** Decision Tree Classifier (78.57% test accuracy)
- **Models Evaluated:** Linear SVM, Logistic Regression, Random Forest, Decision Tree
- **Preprocessing:** Median imputation for physiological zeros, StandardScaler normalization
- **Evaluation:** Accuracy, Precision, Recall, F1-Score, ROC-AUC

## 📁 Project Structure

```
DPS/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── core/           # Configuration, security, database
│   │   ├── models/         # SQLAlchemy models (User, Prediction, ActivityLog)
│   │   ├── schemas/        # Pydantic schemas for validation
│   │   ├── routes/         # API endpoints (auth, prediction, admin, etc.)
│   │   ├── services/       # Business logic (auth, ML, stats, reports)
│   │   └── main.py         # FastAPI application entry point
│   ├── ml/
│   │   ├── train.py        # ML training pipeline
│   │   └── evaluation_results/  # Model evaluation charts
│   ├── requirements.txt     # Python dependencies
│   └── tests/              # Backend tests
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components (Navbar, Sidebar, etc.)
│   │   ├── layouts/        # Page layouts (AppLayout, PublicLayout)
│   │   ├── pages/          # Route pages (Dashboard, Prediction, etc.)
│   │   ├── services/       # API service layer (api.js)
│   │   ├── context/        # React contexts (Auth, Theme)
│   │   ├── App.jsx         # Main routing configuration
│   │   └── main.jsx        # React entry point
│   ├── package.json       # Node dependencies
│   ├── vite.config.js      # Vite configuration
│   └── tailwind.config.js  # TailwindCSS configuration
├── models/                 # Trained ML models and metadata
│   ├── diabetes_best_model.joblib
│   ├── diabetes_svm_baseline.joblib
│   ├── model_metadata.json
│   └── *.png              # Evaluation charts
├── dataset/                # Training data
│   └── diabetes.csv
├── start_backend.bat       # Windows startup script (backend)
├── start_frontend.bat      # Windows startup script (frontend)
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## 🛠️ Installation & Setup

### Prerequisites

- **Python:** 3.9 or higher
- **Node.js:** 16 or higher (includes npm)
- **Git:** For cloning the repository

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   - **Windows:**
     ```bash
     venv\Scripts\activate
     ```
   - **Linux/Mac:**
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure environment variables:**
   - Copy `.env.example` to `.env` in the project root
   - Update values as needed (especially `SECRET_KEY` for production)

6. **Ensure ML models are available:**
   - The `models/` directory should contain trained model files
   - If not available, run the training pipeline:
     ```bash
     python backend/ml/train.py
     ```

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## 🚀 Running the Application

### Quick Start (Windows)

Simply double-click the batch files:

- `start_backend.bat` - Starts the FastAPI backend server
- `start_frontend.bat` - Starts the Vite frontend development server

### Manual Start

#### Backend

```bash
# From project root
cd backend

# Activate virtual environment (if not already active)
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Start the server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The backend API will be available at:
- **API:** http://127.0.0.1:8000
- **Docs:** http://127.0.0.1:8000/docs (Swagger UI)
- **Alt Docs:** http://127.0.0.1:8000/redoc (ReDoc)

#### Frontend

```bash
# From project root
cd frontend

# Start the development server
npm run dev
```

The frontend will be available at:
- **App:** http://localhost:5173
- **Network:** http://192.168.x.x:5173 (for local network access)

### Production Build

To build the frontend for production:

```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/`. Serve these with a web server like Nginx or serve them with FastAPI.

## 📊 Default Accounts

The system automatically seeds the following accounts on first run:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@diabetesrisk.org | Admin@Diabetes2026 |
| Demo User | demo@diabetesrisk.org | User@Diabetes2026 |

**⚠️ Important:** Change these passwords in production before deployment.

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Predictions
- `POST /api/predict` - Create a new prediction
- `GET /api/predictions` - List user predictions (paginated)
- `GET /api/predictions/{id}` - Get single prediction
- `DELETE /api/predictions/{id}` - Delete prediction

### Dashboard
- `GET /api/dashboard/stats` - User dashboard statistics
- `GET /api/dashboard/history` - User prediction history

### Admin
- `GET /api/admin/stats` - System-wide statistics
- `GET /api/admin/users` - List users (paginated, searchable)
- `DELETE /api/admin/users/{id}` - Delete user
- `GET /api/admin/predictions` - List all predictions

### ML Analytics
- `GET /api/model/info` - Model information
- `GET /api/model/metrics` - Model evaluation metrics
- `GET /api/model/visualizations/{chart_name}` - Evaluation charts

### Reports
- `GET /api/reports/{id}/pdf` - Download PDF report

## 🧪 Testing

### Backend Tests

```bash
cd backend
python -m pytest tests/ -v
```

Or use the provided test runner:
```bash
cd backend/tests
python run_tests.py
```

### Frontend Build Verification

```bash
cd frontend
npm run build
```

## 📈 Model Performance

The selected Decision Tree model achieved the following metrics on the test set (154 samples):

| Metric | Value |
|--------|-------|
| Accuracy | 78.57% |
| Precision | 69.09% |
| Recall | 70.37% |
| F1-Score | 69.72% |
| ROC-AUC | 0.774 |

### Feature Importance

1. Glucose (52.89%)
2. BMI (16.63%)
3. Age (13.07%)
4. Insulin (8.50%)
5. Diabetes Pedigree Function (5.31%)
6. Pregnancies (3.60%)
7. Blood Pressure (0.00%)
8. Skin Thickness (0.00%)

## 🔒 Security Notes

- JWT tokens expire after 24 hours (configurable)
- Passwords are hashed using bcrypt
- CORS is configured for specific origins
- Admin routes require admin role
- User data isolation (users can only access their own predictions)

## 🐛 Troubleshooting

### Backend Issues

**Problem:** Module not found errors
- **Solution:** Ensure virtual environment is activated and dependencies are installed

**Problem:** Database locked errors
- **Solution:** Close any other processes accessing the database, or delete `diabetes_app.db` to recreate

**Problem:** Model loading errors
- **Solution:** Ensure `models/` directory exists and contains trained model files

### Frontend Issues

**Problem:** npm command not found
- **Solution:** Install Node.js from https://nodejs.org/

**Problem:** Port 5173 already in use
- **Solution:** Modify `vite.config.js` to use a different port, or stop the process using port 5173

**Problem:** API connection errors
- **Solution:** Ensure backend is running on http://127.0.0.1:8000

## 📝 License

This project is for academic demonstration purposes. The PIMA Indian Diabetes Dataset is publicly available for research.

## 👥 Authors

- **Development Team:** DPS Project Team
- **Academic Context:** 7th Semester Major Project

## 🙏 Acknowledgments

- PIMA Indian Diabetes Dataset (National Institute of Diabetes and Digestive and Kidney Diseases)
- scikit-learn ML library
- FastAPI framework
- React and Vite
- TailwindCSS

---

**Last Updated:** November 2026
**Version:** 1.0.0
