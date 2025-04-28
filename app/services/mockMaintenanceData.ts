import { MaintenanceRequest } from '../../services/mockData';

export const mockMaintenanceRequests: MaintenanceRequest[] = [
  {
    id: '1',
    propertyId: 'prop1',
    renterId: 'user3',
    title: 'Leaking Faucet',
    description: 'Kitchen sink faucet is leaking and needs repair',
    status: 'pending',
    createdAt: '2024-03-15T00:00:00.000Z',
  },
  {
    id: '2',
    propertyId: 'prop2',
    renterId: 'user3',
    title: 'Broken AC',
    description: 'Air conditioning unit not cooling properly',
    status: 'scheduled',
    createdAt: '2024-03-10T00:00:00.000Z',
    scheduledDate: '2024-03-20T00:00:00.000Z',
  },
  {
    id: '3',
    propertyId: 'prop2',
    renterId: 'user3',
    title: 'Electrical Issue',
    description: 'Power outlet in living room not working',
    status: 'completed',
    createdAt: '2024-03-05T00:00:00.000Z',
    completedDate: '2024-03-08T00:00:00.000Z',
  },
  {
    id: '4',
    propertyId: 'prop3',
    renterId: 'user4',
    title: 'Paint Touch-up',
    description: 'Wall paint needs touch-up in bedroom',
    status: 'pending',
    createdAt: '2024-03-20T00:00:00.000Z',
  },
];

export const getMaintenanceRequests = (renterId: string) => {
  return mockMaintenanceRequests.filter((request) => request.renterId === renterId);
};

export const getActiveRequests = (renterId: string) => {
  return getMaintenanceRequests(renterId).filter(
    (request) => request.status !== 'completed' && request.status !== 'cancelled',
  );
};

export const getPastRequests = (renterId: string) => {
  return getMaintenanceRequests(renterId).filter(
    (request) => request.status === 'completed' || request.status === 'cancelled',
  );
};
