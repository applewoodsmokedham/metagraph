import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * NavBar Component
 * 
 * Navigation bar for the application with links to different sections
 */
const NavBar = () => {
  return (
    <nav className="main-nav">
      <ul className="nav-list">
        <li className="nav-item">
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            end
          >
            Home
          </NavLink>
        </li>
        
        <li className="nav-item">
          <span className="nav-section-title">Core Alkanes Functions</span>
          <ul className="nav-sublist">
            <li>
              <NavLink 
                to="/api-methods/trace" 
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                trace
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/api-methods/simulate" 
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                simulate
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/api-methods/traceblock" 
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                traceblock
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/api-methods/multisimulate" 
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                multisimulate
              </NavLink>
            </li>
          </ul>
        </li>

        <li className="nav-item">
          <span className="nav-section-title">Protorune Functions</span>
          <ul className="nav-sublist">
            <li>
              <NavLink 
                to="/api-methods/protorunesbyaddress" 
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                protorunesbyaddress
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/api-methods/protorunesbyoutpoint" 
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                protorunesbyoutpoint
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/api-methods/protorunesbyheight" 
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                protorunesbyheight
              </NavLink>
            </li>
          </ul>
        </li>

        <li className="nav-item">
          <span className="nav-section-title">JSON-RPC Methods</span>
          <ul className="nav-sublist">
            <li>
              <NavLink 
                to="/api-methods/metashrew_height" 
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                metashrew_height
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/api-methods/btc_getblockcount" 
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                btc_getblockcount
              </NavLink>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;