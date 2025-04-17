import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Landing from './components/landing';
import Blog from './components/blog';
import Search from './components/search';
import About from './components/about';
import Recommend from './components/recommendpage';
import Filter from './components/filter';
import Profile from './components/profile';
import store from './store/store';
import { Provider } from 'react-redux';

function App() {
  // We don't need this state anymore if we're using a single profile route
  // const [loginState, setLoginState] = useState("/profile");

  return (
    <Provider store={store}>
      <Router>
        <div>
          
        <Routes>
            <Route path="/blog" element={<Blog />} />
            <Route path="/filter" element={<Filter />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/about" element={<About />} />
            <Route path="/recommend" element={<Recommend />} />
            <Route path="/search" element={<Search />} />
            <Route path="/" element={<Landing />} />
        </Routes>
        </div>
      </Router>
    </Provider>
    
  );
}

export default App;
