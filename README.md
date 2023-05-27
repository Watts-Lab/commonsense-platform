# Commonsense Platform

## Description
This project is a web application built using Express.js and React. It serves as a platform for users to complete a common sense survey. The application allows users to answer survey questions and provides an interactive interface for collecting and analyzing survey data.


## Goals and Vision

The primary goal of the platform is to create an online space where individuals can actively contribute to the Common Sense project. Users are encouraged to participate in surveys and provide valuable data that contributes to the understanding of common sense.

## Getting Started
To run the application locally, follow these steps:

1. Clone the repository:

```bash
git clone https://github.com/Watts-Lab/Commonsense-Platform.git
```

2. Install the dependencies for the frontend and backend:

```bash
cd Commonsense-Platform
cd client
npm install
cd ../server
npm install
```

3. Configure the backend:
- Create a MySQL database and update the database configuration in the server's `config.json` file.
- Run database migrations to create the necessary tables:
```bash
npx sequelize-cli db:migrate
```
4. Start the development servers:

Start the backend server:

```bash
npm run dev
```

Start the frontend development server:

```bash
cd ../client
npm run dev
```

5. Access the application in your browser at `http://localhost:5173`.

## Contributing
Contributions to this project are welcome! If you have any suggestions, bug reports, or feature requests, please open an issue or submit a pull request. Make sure to follow the project's code of conduct.

## License
This project is licensed under the [MIT License](link-to-license).

## Contact
For any inquiries or questions, you can reach out to the project maintainers:

- Mark Whiting: [GitHub](https://github.com/markwhiting) | [Email](mark@whiting.me)
- Amirhossein Nakhaei: [GitHub](https://github.com/amirrr) | [Email](maintainer@example.com)


