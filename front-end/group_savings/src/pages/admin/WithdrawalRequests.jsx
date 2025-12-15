import React from 'react';
import { Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const WithdrawalRequests = () => {
  return (
    <div className="container py-4">
      <h2 className="mb-4">Pending Withdrawal Requests</h2>
      <Card className="text-center p-4">
        <Card.Body>
          <h5>No pending withdrawal requests</h5>
          <p className="text-muted">All withdrawal requests have been processed.</p>
        </Card.Body>
      </Card>
    </div>
  );
};

export default WithdrawalRequests;
