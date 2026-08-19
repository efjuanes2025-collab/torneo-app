:root {
    --primary: #6366f1;
    --secondary: #10b981;
    --danger: #ef4444;
    --background: #fafafa;
    --card: #ffffff;
    --text: #1e293b;
    --border: #e2e8f0;
    
    /* Colores pastel para banners */
    --pastel-blue: linear-gradient(135deg, #dbeafe, #bfdbfe);
    --pastel-green: linear-gradient(135deg, #d1fae5, #a7f3d0);
    --pastel-purple: linear-gradient(135deg, #e9d5ff, #d8b4fe);
    --pastel-pink: linear-gradient(135deg, #fce7f3, #fbcfe8);
    --pastel-orange: linear-gradient(135deg, #ffedd5, #fed7aa);
    --pastel-teal: linear-gradient(135deg, #ccfbf1, #99f6e4);
    --pastel-yellow: linear-gradient(135deg, #fef3c7, #fde68a);
    --pastel-red: linear-gradient(135deg, #fee2e2, #fecaca);
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--background);
    color: var(--text);
    line-height: 1.6;
}

.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
}

/* Header Principal con degradado */
.main-header {
    text-align: center;
    padding: 40px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 16px;
    margin-bottom: 30px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.main-header h1 {
    font-size: 2.5rem;
    margin-bottom: 10px;
}

/* Secciones */
.config-section {
    background: var(--card);
    padding: 30px;
    border-radius: 16px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
    margin-bottom: 30px;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
}

.form-group {
    margin-bottom: 20px;
}

label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #4a5568;
}

select, input, textarea {
    width: 100%;
    padding: 14px;
    border: 2px solid var(--border);
    border-radius: 10px;
    font-size: 16px;
    transition: all 0.3s;
    background: white;
}

select:focus, input:focus, textarea:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

textarea {
    resize: vertical;
    min-height: 150px;
    font-family: inherit;
}

/* Botones */
.button-group {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
}

.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 14px 30px;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    flex: 1;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(99, 102, 241, 0.4);
}

.btn-secondary {
    background: white;
    color: var(--primary);
    padding: 14px 25px;
    border: 2px solid var(--primary);
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-secondary:hover {
    background: #f3f4f6;
}

.btn-pdf {
    background: linear-gradient(135deg, #f87171, #ef4444);
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;
}

.btn-pdf:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.hidden {
    display: none;
}

/* Banners de Grupos con degradados pastel */
.group-banner {
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 20px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

.group-banner h3 {
    font-size: 1.3rem;
    margin-bottom: 15px;
    color: #333;
}

.group-banner-0 { background: var(--pastel-blue); }
.group-banner-1 { background: var(--pastel-green); }
.group-banner-2 { background: var(--pastel-purple); }
.group-banner-3 { background: var(--pastel-pink); }
.group-banner-4 { background: var(--pastel-orange); }
.group-banner-5 { background: var(--pastel-teal); }
.group-banner-6 { background: var(--pastel-yellow); }
.group-banner-7 { background: var(--pastel-red); }

/* Bracket Styles */
.bracket-round {
    margin-bottom: 30px;
}

.round-header {
    background: linear-gradient(135deg, #818cf8, #6366f1);
    color: white;
    padding: 15px;
    border-radius: 10px;
    margin-bottom: 20px;
}

.round-header h3 {
    font-size: 1.2rem;
}

.match-card {
    background: var(--card);
    border: 2px solid var(--border);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 15px;
    transition: transform 0.2s, box-shadow 0.2s;
}

.match-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0,0,0,0.1);
}

.match-venue {
    display: inline-block;
    background: #e0e7ff;
    color: #4f46e5;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 10px;
}

.match-teams {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.team-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
}

.team-name {
    font-weight: 600;
    flex: 1;
}

.team-score {
    width: 60px;
    padding: 10px;
    border: 2px solid var(--border);
    border-radius: 8px;
    text-align: center;
    font-weight: 700;
    font-size: 16px;
}

.winner-badge {
    background: #10b981;
    color: white;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
}

/* Grupos Container */
.groups-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.group-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(0,0,0,0.08);
}

.group-title {
    padding: 15px;
    font-weight: 700;
    font-size: 1.1rem;
}

.group-teams {
    padding: 15px;
}

.group-team {
    padding: 8px;
    border-bottom: 1px solid #f3f4f6;
    display: flex;
    justify-content: space-between;
}

/* Tabla de Clasificación */
.standings-table {
    width: 100%;
    background: white;
    border-collapse: collapse;
    box-shadow: 0 4px 10px rgba(0,0,0,0.08);
    border-radius: 12px;
    overflow: hidden;
}

.standings-table th {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    padding: 15px;
    text-align: left;
    font-size: 14px;
}

.standings-table td {
    padding: 12px 15px;
    border-bottom: 1px solid var(--border);
    font-size: 14px;
}

.standings-table tr:hover {
    background: #f9fafb;
}

.standings-table tr:nth-child(even) {
    background: #f8fafc;
}

.position-1 { background: #fef3c7 !important; }
.position-2 { background: #e5e7eb !important; }
.position-3 { background: #fed7aa !important; }

/* Responsive */
@media (max-width: 768px) {
    .form-row {
        grid-template-columns: 1fr;
        gap: 0;
    }
    
    .main-header h1 {
        font-size: 1.8rem;
    }
    
    .team-row {
        flex-direction: column;
        align-items: stretch;
    }
    
    .button-group {
        flex-direction: column;
    }
    
    .btn-primary, .btn-secondary {
        width: 100%;
    }
}
