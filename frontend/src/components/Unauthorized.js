import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 text-center">
          <h1 className="text-danger">403 - Unauthorized Access</h1>
          <p className="lead">You don't have permission to access this page.</p>
          <Link to="/" className="btn btn-primary">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
