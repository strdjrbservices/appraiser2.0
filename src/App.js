import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Subject from './components/Subject/subject.js';
import CustomQuery from './components/Subject/CustomQuery.js';
import HomePage from './components/Subject/HomePage.js';
import Compare from './components/Subject/Compare.js';
import './App.css';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ResponsePage from './components/Subject/response';
import ConfirmationChecklist from './components/Subject/ConfirmationChecklist';
import HtmlExtractor from './components/Subject/HtmlExtractor';

function App() {
  const location = useLocation();

  return (
    <>
      {location.pathname !== '/' && (
        <nav className="navbar navbar-light bg-light px-3">
          <Link to="/"
            className={`btn animated-back-button ${location.pathname === '/' ? 'btn-primary' : 'btn-outline-primary'
              } navbar-brand mb-0 h1`}
            style={{ marginLeft: 100 }}
          >
            <ArrowBackIcon />

          </Link>
          <div>
            <Link
              to="/extractor"
              className={`btn ${location.pathname === '/extractor' ? 'btn-primary' : 'btn-buttom-primary'
                } me-2`}
               
            >
              Appraisal Extractor
            </Link>
            <Link
              to="/query"
              className={`btn ${location.pathname === '/query' ? 'btn-primary' : 'btn-buttom-primary'
                }`}
            >
              Custom Query
            </Link>
            <Link
              to="/Compare"
              
              className={`btn ${location.pathname === '/Compare' ? 'btn-primary' : 'btn-buttom-primary'
                }`}
            >
              PDF/HTML Comparison
            </Link>
            <Link
              to="/response"
              className={`btn ${location.pathname === '/response' ? 'btn-primary' : 'btn-buttom-primary'
                }`}
            >
              Revision Verification
            </Link>
            <Link
              to="/confirmation"
                className={`btn ${location.pathname === '/confirmation' ? 'btn-primary' : 'btn-buttom-primary'
                }`}
            >
              Confirmation Checklist
            </Link>
            <Link
              to="/html-extractor"
                className={`btn ${location.pathname === '/html-extractor' ? 'btn-primary' : 'btn-buttom-primary'
                }`}
            >
              HTML Extractor
            </Link>
          </div>
        </nav>
      )}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/extractor" element={<Subject />} />
        <Route path="/query" element={<CustomQuery />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/response" element={<ResponsePage />} />
        <Route path="/confirmation" element={<ConfirmationChecklist />} />
        <Route path="/html-extractor" element={<HtmlExtractor />} />
      </Routes>
    </>
  );
}

export default App;
