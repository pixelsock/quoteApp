# Matrix Mirrors Quote Generator

This is a React-based application for generating quotes for Matrix Mirrors products.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- A Dropbox account and API key for PDF storage

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/matrix-mirrors-react.git
   ```

2. Navigate to the project directory:
   ```
   cd matrix-mirrors-react
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Create a `.env` file in the root directory and add your Dropbox access token:
   ```
   VITE_DROPBOX_ACCESS_TOKEN=your_dropbox_access_token_here
   ```

### Running the Application

To start the development server:

```
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is already in use).

### Building for Production

To create a production build:

```
npm run build
```

The built files will be in the `dist` directory.

## Features

- Dynamic form for selecting mirror options
- Quote summary page
- PDF generation of quotes
- Dropbox integration for storing and sharing PDFs
- Responsive design

## Sample Data Generation

To facilitate development and testing, a sample dataset can be generated from the full product catalog. This sample dataset contains a subset of 10 randomly selected items from the full catalog.

To generate the sample dataset:

1. Ensure you're in the project root directory.
2. Run the following command:
   ```
   python generate_sample_data.py
   ```
3. The sample dataset will be generated and saved as `src/data/sample_output.json`.

This sample data can be used for testing the QuoteForm, QuoteSummary, and PDF generation functionalities without needing to load the entire product catalog.

## Built With

- [React](https://reactjs.org/)
- [React Router](https://reactrouter.com/)
- [jsPDF](https://github.com/MrRio/jsPDF)
- [Vite](https://vitejs.dev/)
- [Axios](https://axios-http.com/)

## Project Structure

- `src/components/`: React components
- `src/context/`: React context for state management
- `src/utils/`: Utility functions (e.g., PDF generation)
- `src/data/`: JSON data for product information

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

- Matrix Mirrors for the project requirements and data
- All contributors to the open-source libraries used in this project
