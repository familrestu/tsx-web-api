const database = (): Promise<{ message: string }> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('database connected.');
            resolve({ message: 'successfully connected to database' });
        }, 1000);
    });
};

export default database;
