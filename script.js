<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🏆 Gestor de Torneos - Diagrama Visual</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            background: #f0f2f5;
            padding: 20px;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            margin-bottom: 30px;
        }
        
        .card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
            color: #333;
        }
        
        input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
            margin-bottom: 8px;
        }
        
        .btn {
            padding: 14px 30px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            margin: 5px;
            transition: all 0.3s;
        }
        
        .btn-primary {
            background: #4f46e5;
            color: white;
        }
        
        .btn-primary:hover {
            background: #4338ca;
        }
        
        .btn-secondary {
            background: #e0e7ff;
            color: #4f46e5;
        }
        
        .hidden {
            display: none;
        }
        
        /* Diagrama de Fases */
        .phase-diagram {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 30px;
            margin: 20px 0;
            overflow-x: auto;
            background: #f8fafc;
            border-radius: 10px;
        }
        
        .phase-box {
            background: white;
            border: 3px solid #4f46e5;
            border-radius: 12px;
            padding: 20px;
            min-width: 150px;
            text-align: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            position: relative;
        }
        
        .phase-box.active {
            background: #4f46e5;
            color: white;
            border-color: #4338ca;
        }
        
        .phase-box.completed {
            background: #10b981;
            color: white;
            border-color: #059669;
        }
        
        .phase-arrow {
            font-size: 30px;
            color: #4f46e5;
        }
        
        .phase-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .phase-detail {
            font-size: 13px;
            opacity: 0.8;
        }
        
        /* Grupos */
        .groups-diagram {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .group-box {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        
        .group-header {
            padding: 15px;
            font-weight: bold;
            text-align: center;
            font-size: 18px;
        }
        
        .group-teams {
            padding: 15px;
        }
        
        .team-item {
            padding: 10px;
            margin: 5px 0;
            border-radius: 8px;
            background: #f8fafc;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .team-item.qualified {
            background: #d1fae5;
            border-left: 4px solid #10b981;
        }
        
        /* Partidos por Ronda */
        .round-container {
            margin-bottom: 30px;
        }
        
        .round-header {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            margin-bottom: 15px;
            font-weight: bold;
            font-size: 18px;
        }
        
        .matches-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 15px;
        }
        
        .match-card {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            padding: 15px;
        }
        
        .venue-badge {
            display: inline-block;
            background: #4f46e5;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .team-row {
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 8px 0;
        }
        
        .team-name {
            flex: 1;
            font-weight: 600;
        }
        
        .score-input {
            width: 60px;
            padding: 8px;
            border: 2px solid #e0e0e0;
            border-radius: 6px;
            text-align: center;
            font-weight: bold;
            font-size: 16px;
        }
        
        .score-input:focus {
            border-color: #4f46e5;
            outline: none;
        }
        
        .winner-badge {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            margin-top: 5px;
        }
        
        /* Tablas */
        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            margin-bottom: 20px;
        }
        
        th {
            background: #4f46e5;
            color: white;
            padding: 12px;
            text-align: left;
            font-size: 14px;
        }
        
        td {
            padding: 10px 12px;
            border-bottom: 1px solid #e0e0e0;
            font-size: 14px;
        }
        
        tr:nth-child(even) {
            background: #f8fafc;
        }
        
        .position-1 {
            background: #fef3c7 !important;
        }
        
        .position-2 {
            background: #d1fae5 !important;
        }
        
        /* Brackets */
        .bracket-diagram {
            display: flex;
            gap: 20px;
            padding: 20px;
            overflow-x: auto;
        }
        
        .bracket-column {
            flex: 1;
            min-width: 200px;
        }
        
        .bracket-round-title {
            text-align: center;
            font-weight: bold;
            margin-bottom: 15px;
            padding: 10px;
            background: #4f46e5;
            color: white;
            border-radius: 8px;
        }
        
        .bracket-match {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            padding: 10px;
            margin-bottom: 10px;
            min-height: 80px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        
        .colors-0 { background: linear-gradient(135deg, #dbeafe, #bfdbfe); }
        .colors-1 { background: linear-gradient(135deg, #d1fae5, #a7f3d0); }
        .colors-2 { background: linear-gradient(135deg, #e9d5ff, #d8b4fe); }
        .colors-3 { background: linear-gradient(135deg, #fce7f3, #fbcfe8); }
        .colors-4 { background: linear-gradient(135deg, #ffedd5, #fed7aa); }
        .colors-5 { background: linear-gradient(135deg, #ccfbf1, #99f6e4); }
        .colors-6 { background: linear-gradient(135deg, #fef3c7, #fde68a); }
        .colors-7 { background: linear-gradient(135deg, #fee2e2, #fecaca); }
        
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            border-left: 4px solid #10b981;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏆 Gestor de Torneos Profesional</h1>
            <p>Diagrama Visual de Fases y Programación Inteligente</p>
        </div>
        
        <div id="notification" class="notification hidden"></div>
        
        <!-- Configuración -->
        <div class="card">
            <h2>⚙️ Configuración</h2>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0;">
                <div class="form-group">
                    <label>Número de equipos:</label>
                    <input type="number" id="numTeams" min="2" max="32" value="8" onchange="generateTeamInputs()">
                </div>
                
                <div class="form-group">
                    <label>Número de grupos:</label>
                    <input type="number" id="numGroups" min="1" max="8" value="2">
                </div>
                
                <div class="form-group">
                    <label>Número de canchas:</label>
                    <input type="number" id="numVenues" min="1" max="10" value="3">
                </div>
            </div>
            
            <div class="form-group">
                <label>Equipos:</label>
                <div id="teamsInputContainer"></div>
            </div>
            
            <div>
                <button class="btn btn-primary" onclick="generateTournament()">🎲 Generar Torneo</button>
                <button class="btn btn-secondary" onclick="loadExample()">📋 Ejemplo</button>
                <button class="btn btn-secondary" onclick="saveData()">💾 Guardar</button>
                <button class="btn btn-secondary" onclick="loadData()">📂 Cargar</button>
            </div>
        </div>
        
        <!-- Diagrama de Fases -->
        <div id="phaseDiagramSection" class="card hidden">
            <h2>📊 Diagrama de Fases</h2>
            <div id="phaseDiagram" class="phase-diagram"></div>
        </div>
        
        <!-- Grupos -->
        <div id="groupsSection" class="card hidden">
            <h2>👥 Grupos</h2>
            <div id="groupsContainer"></div>
        </div>
        
        <!-- Partidos -->
        <div id="matchesSection" class="card hidden">
            <h2>📅 Programación de Partidos</h2>
            <div id="matchesContainer"></div>
        </div>
        
        <!-- Tablas -->
        <div id="standingsSection" class="card hidden">
            <h2>📊 Tablas de Posiciones</h2>
            <div id="standingsContainer"></div>
        </div>
        
        <!-- Eliminatorias -->
        <div id="knockoutSection" class="card hidden">
            <h2>🏆 Eliminatorias</h2>
            <div id="bracketContainer"></div>
        </div>
    </div>
    
    <script src="script.js"></script>
</body>
</html>
