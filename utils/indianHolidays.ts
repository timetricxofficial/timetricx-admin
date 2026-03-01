export interface Festival {
    date: string; // YYYY-MM-DD
    title: string;
    type: 'national' | 'gazetted' | 'restricted' | 'festive';
}

export const INDIAN_FESTIVALS_2024: Festival[] = [
    { date: '2024-01-01', title: 'New Year Day', type: 'festive' },
    { date: '2024-01-14', title: 'Makar Sankranti', type: 'festive' },
    { date: '2024-01-26', title: 'Republic Day', type: 'national' },
    { date: '2024-02-14', title: 'Basant Panchami', type: 'festive' },
    { date: '2024-03-08', title: 'Maha Shivratri', type: 'festive' },
    { date: '2024-03-25', title: 'Holi', type: 'festive' },
    { date: '2024-04-11', title: 'Eid-ul-Fitr', type: 'festive' },
    { date: '2024-04-17', title: 'Ram Navami', type: 'festive' },
    { date: '2024-04-21', title: 'Mahavir Jayanti', type: 'festive' },
    { date: '2024-05-23', title: 'Buddha Purnima', type: 'festive' },
    { date: '2024-06-17', title: 'Eid-ul-Adha', type: 'festive' },
    { date: '2024-07-17', title: 'Muharram', type: 'festive' },
    { date: '2024-08-15', title: 'Independence Day', type: 'national' },
    { date: '2024-08-19', title: 'Raksha Bandhan', type: 'festive' },
    { date: '2024-08-26', title: 'Janmashtami', type: 'festive' },
    { date: '2024-09-07', title: 'Ganesh Chaturthi', type: 'festive' },
    { date: '2024-09-16', title: 'Eid-e-Milad', type: 'festive' },
    { date: '2024-10-02', title: 'Gandhi Jayanti', type: 'national' },
    { date: '2024-10-12', title: 'Dussehra', type: 'festive' },
    { date: '2024-10-31', title: 'Diwali', type: 'festive' },
    { date: '2024-11-15', title: 'Guru Nanak Jayanti', type: 'festive' },
    { date: '2024-12-25', title: 'Christmas', type: 'festive' },
];

export const INDIAN_FESTIVALS_2025: Festival[] = [
    { date: '2025-01-01', title: 'New Year Day', type: 'festive' },
    { date: '2025-01-14', title: 'Makar Sankranti', type: 'festive' },
    { date: '2025-01-26', title: 'Republic Day', type: 'national' },
    { date: '2025-02-26', title: 'Maha Shivratri', type: 'festive' },
    { date: '2025-03-14', title: 'Holi', type: 'festive' },
    { date: '2025-03-31', title: 'Eid-ul-Fitr', type: 'festive' },
    { date: '2025-04-06', title: 'Ram Navami', type: 'festive' },
    { date: '2025-04-10', title: 'Mahavir Jayanti', type: 'festive' },
    { date: '2025-04-18', title: 'Good Friday', type: 'festive' },
    { date: '2025-05-12', title: 'Buddha Purnima', type: 'festive' },
    { date: '2025-06-07', title: 'Eid-ul-Adha', type: 'festive' },
    { date: '2025-07-06', title: 'Muharram', type: 'festive' },
    { date: '2025-08-15', title: 'Independence Day', type: 'national' },
    { date: '2025-08-16', title: 'Janmashtami', type: 'festive' },
    { date: '2025-08-27', title: 'Ganesh Chaturthi', type: 'festive' },
    { date: '2025-10-02', title: 'Gandhi Jayanti', type: 'national' },
    { date: '2025-10-02', title: 'Dussehra', type: 'festive' },
    { date: '2025-10-20', title: 'Diwali', type: 'festive' },
    { date: '2025-11-05', title: 'Guru Nanak Jayanti', type: 'festive' },
    { date: '2025-12-25', title: 'Christmas', type: 'festive' },
];

export const getAllFestivals = () => {
    return [...INDIAN_FESTIVALS_2024, ...INDIAN_FESTIVALS_2025];
}
