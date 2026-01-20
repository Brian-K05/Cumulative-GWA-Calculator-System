# Cumulative GWA Calculator

A modern, web-based Grade Weighted Average (GWA) calculator system for students to track and calculate their cumulative academic performance across multiple semesters.

## Features

- 📊 **Cumulative GWA Calculation**: Calculate overall GWA from 1st Year 1st Semester to current semester
- 📅 **Multi-Year Support**: Supports 1st to 4th Year, each with 1st and 2nd Semesters
- ➕ **Dynamic Subject Management**: Add/remove subjects dynamically
- 📈 **Real-time Calculations**: Automatic semester and cumulative GWA updates
- 🎯 **Range Filtering**: Select specific semester ranges for GWA calculation
- 💾 **Data Persistence**: All data saved to localStorage (no database required)
- 📄 **PDF Report Generation**: Download comprehensive PDF reports with all grades
- 🎨 **Modern UI**: Clean, awwwards-inspired design with smooth animations
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices

## How to Use

### Quick Start

1. **Open the application**: Simply open `index.html` in your web browser
2. **For PDF downloads**: Use a local server (see [Server Setup Guide](SERVER_SETUP.md))

### Using a Local Server (Recommended for PDF Downloads)

The application works best when served through a local server. See [SERVER_SETUP.md](SERVER_SETUP.md) for detailed instructions.

**Quick setup with Python:**
```bash
python -m http.server 8000
```
Then open: `http://localhost:8000`

## Features in Detail

### Subject Management
- Add subjects dynamically to any semester
- Enter subject name, grade, and units
- Remove subjects with a single click
- Automatic validation of grades and units

### GWA Calculations
- **Semester GWA**: Calculated as Σ(grade × units) / Σ(units) for each semester
- **Cumulative GWA**: Calculated across all selected semesters
- Empty or invalid entries are automatically excluded

### Range Filtering
- Select a range of semesters (e.g., "1st Year 1st Sem to 2nd Year 2nd Sem")
- Only semesters within the range are included in cumulative GWA
- Visual filtering hides excluded semesters

### PDF Reports
- Generate comprehensive PDF reports
- Includes all subjects, grades, and calculated GWAs
- Professional table design
- Includes student name and school name (optional)

## Technical Details

- **Frontend**: Vanilla JavaScript (no frameworks)
- **Styling**: Modern CSS with Grid/Flexbox
- **PDF Generation**: jsPDF with jspdf-autotable
- **Data Storage**: Browser localStorage
- **No Backend Required**: Fully client-side application

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Privacy & Security

- **No Database**: All data is stored locally in your browser
- **No Server**: No data is sent to any server
- **No Tracking**: No analytics or tracking scripts
- **Offline Capable**: Works completely offline

## Developer

**Developed by:** Brian Kyle L. Salor  
**Email:** briankylesalor02@gmail.com

Free to use for academic purposes.

## License

Copyright (c) 2026 Brian Kyle L. Salor

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Important**: If you use, modify, or distribute this code, you must:
- Include the original copyright notice
- Include the LICENSE file
- Credit **Brian Kyle L. Salor** as the original developer

This project is free to use for academic and personal purposes, but attribution is required.

---

**Note**: This calculator is for personal tracking purposes only and does not replace official school portals or grade systems.

