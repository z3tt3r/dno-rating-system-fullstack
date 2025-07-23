import React from 'react';
import type { Client } from '../types/dtos'; 

interface ClientsTableProps {
  clients: Client[];
}

const ClientsTable: React.FC<ClientsTableProps> = ({ clients }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">Client Database</h5>
      </div>
      <div className="card-body">
        {clients.length === 0 ? (
          <div className="text-center text-muted py-4">
            No clients in database yet
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>IČO</th>
                  <th>Address</th>
                  <th>City</th>
                  <th>State</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td><strong>{client.name}</strong></td>
                    <td>{client.ico}</td>
                    <td>
                      {client.street} {client.houseNumber}
                      {client.orientationNumber && `/${client.orientationNumber}`}
                    </td>
                    <td>{client.city}, {client.postcode}</td>
                    <td>{client.state}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientsTable;