import { API } from './endpoints';
import axios from './axios';

export interface Appointment {
    id?: string;
    _id?: string;
    roomId: string;
    ownerId: string;
    renterId: string;
    renterName: string;
    renterEmail: string;
    renterPhone: string;
    appointmentDate: string;
    appointmentTime: string;
    message?: string;
    status: 'pending' | 'confirmed' | 'approved' | 'rejected' | 'completed' | 'cancelled';
    createdAt?: string;
    updatedAt?: string;
    room?: {
        id: string;
        roomTitle: string;
        location: string;
        monthlyPrice: number;
        images: string[];
        roomType?: any;
    };
}

export const appointmentApi = {
    // Book appointment
    bookAppointment: async (data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
        const response = await axios.post(API.APPOINTMENT.BOOK, data);
        return response.data;
    },

    // Get my appointments
    getMyAppointments: async (renterId: string) => {
        const response = await axios.get(API.APPOINTMENT.GET_RENTER(renterId));
        return response.data;
    },

    // Get owner appointments
    getOwnerAppointments: async (ownerId: string) => {
        const response = await axios.get(API.APPOINTMENT.GET_OWNER(ownerId));
        return response.data;
    },

    // Get appointment by ID
    getAppointmentById: async (id: string) => {
        const response = await axios.get(API.APPOINTMENT.GET_BY_ID(id));
        return response.data;
    },

    // Update appointment status
    updateAppointmentStatus: async (id: string, status: string) => {
        const response = await axios.put(API.APPOINTMENT.UPDATE_STATUS(id), { status });
        return response.data;
    },

    // Update appointment (date, time, message)
    updateAppointment: async (id: string, data: { appointmentDate: string; appointmentTime: string; message?: string }) => {
        const response = await axios.put(API.APPOINTMENT.UPDATE(id), data);
        return response.data;
    },

    // Cancel appointment
    cancelAppointment: async (id: string) => {
        const response = await axios.delete(API.APPOINTMENT.CANCEL(id));
        return response.data;
    },
};
