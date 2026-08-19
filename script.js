// ============ VARIABLES GLOBALES ============
let teams = [];
let groups = [];
let groupMatches = [];
let knockoutBrackets = [];
let standings = {};
let numTeams = 8;
let numGroups = 2;
let numVenues = 3;
let currentPhase = 'config'; // config, groups, knockout, finished

// ============ INICIALIZACIÓN ============
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema iniciado');
    generateTeamInputs();
});

// ============ GENERAR INPUTS ============
function generateTeamInputs() {
    numTeams = parseInt(document.getElementById('numTeams').value) || 8;
    const container = document.getElementById('teamsInputContainer');
    container.innerHTML = '';
    
    const defaultNames = [
        'Argentina', 'Brasil', 'Francia', 'Alemania',
        'España', 'Inglaterra', 'Portugal', 'Holanda',
        'Italia', 'Bélgica', 'Uruguay', 'Croacia',
        'México', 'Japón', 'Colombia', 'Senegal'
    ];
    
    for (let i = 0; i < numTeams; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'team_' + i;
        input.value = defaultNames[i] || ('Equipo ' + (i + 1));
        input.placeholder = 'Nombre del equipo ' + (i + 1);
        container.appendChild(input);
    }
}

// ============ CARGAR EJEMPLO ============
function loadExample() {
    const exampleTeams = [
        'Argentina', 'Brasil', 'Francia', 'Alemania',
        'España', 'Inglaterra', 'Portugal', 'Holanda'
    ];
    
    document.getElementById('numTeams').value = 8;
    document.getElementById('numGroups').value = 2;
    document.getElementById('numVenues').value = 3;
    
    generateTeamInputs();
    
    for (let i = 0; i < exampleTeams.length; i++) {
        const input = document.getElementById('team_' + i);
        if (input) input.value = exampleTeams[i];
    }
    
    showNotification('📋 Ejemplo cargado: 8 equipos, 2 grupos, 3 canchas');
}

// ============ GENERAR TORNEO ============
function generateTournament() {
    console.log('Generando torneo...');
    
    // Obtener equipos
    teams = [];
    for (let i = 0; i < numTeams; i++) {
        const input = document.getElementById('team_' + i);
        if (input && input.value.trim() !== '') {
            teams.push(input.value.trim());
        }
    }
    
    if (teams.length < 2) {
        showNotification('❌ Necesitas al menos 2 equipos', 'error');
        return;
    }
    
    numGroups = parseInt(document.getElementById('numGroups').value) || 1;
    numVenues = parseInt(document.getElementById('numVenues').value) || 1;
    
    currentPhase = 'groups';
    
    // Distribuir en grupos
    distributeToGroups();
    
    // Generar partidos con programación inteligente
    generateGroupMatches();
    
    // Generar eliminatorias
    generateKnockoutBrackets();
    
    // Mostrar secciones
    document.getElementById('phaseDiagramSection').classList.remove('hidden');
    document.getElementById('groupsSection').classList.remove('hidden');
    document.getElementById('matchesSection').classList.remove('hidden');
    document.getElementById('standingsSection').classList.remove('hidden');
    document.getElementById('knockoutSection').classList.remove('hidden');
    
    // Renderizar
    renderPhaseDiagram();
    renderGroups();
    renderMatches();
    renderStandings();
    renderBrackets();
    
    showNotification('✅ Torneo generado con programación inteligente');
}

// ============ DISTRIBUIR EN GRUPOS ============
function distributeToGroups() {
    groups = [];
    standings = {};
    
    const shuffled = [...teams].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < numGroups; i++) {
        groups.push({
            id: i,
            name: 'Grupo ' + String.fromCharCode(65 + i),
            teams: []
        });
    }
    
    shuffled.forEach((team, index) => {
        const groupIndex = index % numGroups;
        groups[groupIndex].teams.push(team);
    });
    
    groups.forEach(group => {
        standings[group.id] = {};
        group.teams.forEach(team => {
            standings[group.id][team] = {
                points: 0, played: 0, wins: 0, draws: 0, losses: 0,
                goalsFor: 0, goalsAgainst: 0, goalDiff: 0
            };
        });
    });
}

// ============ GENERAR PARTIDOS CON PROGRAMACIÓN INTELIGENTE ============
function generateGroupMatches() {
    groupMatches = [];
    let matchId = 1;
    
    // Generar todos los partidos primero
    const allMatches = [];
    
    groups.forEach(group => {
        const teamsInGroup = group.teams;
        
        for (let i = 0; i < teamsInGroup.length; i++) {
            for (let j = i + 1; j < teamsInGroup.length; j++) {
                allMatches.push({
                    groupId: group.id,
                    groupName: group.name,
                    team1: teamsInGroup[i],
                    team2: teamsInGroup[j]
                });
            }
        }
    });
    
    // Programar partidos por rondas sin conflictos
    let round = 1;
    let remainingMatches = [...allMatches];
    
    while (remainingMatches.length > 0) {
        const teamsPlayingThisRound = new Set();
        const matchesThisRound = [];
        const matchesToRemove = [];
        
        // Seleccionar partidos que no tengan conflicto de equipos
        for (let i = 0; i < remainingMatches.length; i++) {
            const match = remainingMatches[i];
            
            if (!teamsPlayingThisRound.has(match.team1) && 
                !teamsPlayingThisRound.has(match.team2)) {
                
                // Verificar límite de canchas
                if (matchesThisRound.length < numVenues) {
                    matchesThisRound.push(match);
                    teamsPlayingThisRound.add(match.team1);
                    teamsPlayingThisRound.add(match.team2);
                    matchesToRemove.push(i);
                }
            }
        }
        
        // Asignar canchas a los partidos de esta ronda
        matchesThisRound.forEach((match, index) => {
            groupMatches.push({
                id: matchId,
                groupId: match.groupId,
                groupName: match.groupName,
                round: round,
                team1: match.team1,
                team2: match.team2,
                score1: null,
                score2: null,
                winner: null,
                venue: 'Cancha ' + (index + 1),
                status: 'pending'
            });
            matchId++;
        });
        
        // Eliminar partidos programados
        matchesToRemove.sort((a, b) => b - a);
        matchesToRemove.forEach(index => {
            remainingMatches.splice(index, 1);
        });
        
        round++;
    }
}

// ============ GENERAR ELIMINATORIAS ============
function generateKnockoutBrackets() {
    knockoutBrackets = [];
    
    const qualifiedCount = numGroups * 2;
    const numRounds = Math.log2(qualifiedCount);
    
    let matchId = groupMatches.length + 1;
    
    const roundNames = {
        1: 'Cuartos de Final',
        2: 'Semifinales',
        3: 'Final'
    };
    
    for (let round = 1; round <= numRounds; round++) {
        const matchesInRound = qualifiedCount / Math.pow(2, round);
        const roundMatches = [];
        
        for (let i = 0; i < matchesInRound; i++) {
            roundMatches.push({
                id: matchId,
                round: round,
                roundName: roundNames[round] || ('Ronda ' + round),
                team1: null,
                team2: null,
                score1: null,
                score2: null,
                winner: null,
                venue: 'Cancha ' + (i % numVenues + 1),
                status: 'pending'
            });
            matchId++;
        }
        
        knockoutBrackets.push(roundMatches);
    }
}

// ============ RENDERIZAR DIAGRAMA DE FASES ============
function renderPhaseDiagram() {
    const container = document.getElementById('phaseDiagram');
    container.innerHTML = '';
    
    const phases = [
        { name: 'Configuración', detail: teams.length + ' equipos', status: 'completed' },
        { name: 'Fase de Grupos', detail: numGroups + ' grupos', status: currentPhase === 'groups' ? 'active' : (currentPhase === 'knockout' || currentPhase === 'finished' ? 'completed' : '') },
        { name: 'Eliminatorias', detail: (numGroups * 2) + ' clasificados', status: currentPhase === 'knockout' ? 'active' : (currentPhase === 'finished' ? 'completed' : '') },
        { name: 'Campeón', detail: '1 ganador', status: currentPhase === 'finished' ? 'active' : '' }
    ];
    
    phases.forEach((phase, index) => {
        if (index > 0) {
            container.innerHTML += '<div class="phase-arrow">→</div>';
        }
        
        container.innerHTML += `
            <div class="phase-box ${phase.status}">
                <div class="phase-title">${phase.name}</div>
                <div class="phase-detail">${phase.detail}</div>
            </div>
        `;
    });
}

// ============ RENDERIZAR GRUPOS ============
function renderGroups() {
    const container = document.getElementById('groupsContainer');
    container.innerHTML = '<div class="groups-diagram">';
    
    groups.forEach((group, index) => {
        container.innerHTML += `
            <div class="group-box">
                <div class="group-header colors-${index % 8}">
                    ${group.name}
                </div>
                <div class="group-teams">
                    ${group.teams.map(team => `
                        <div class="team-item">
                            <span>${team}</span>
                            <span style="font-size: 12px; color: #666;">${index + 1}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    container.innerHTML += '</div>';
}

// ============ RENDERIZAR PARTIDOS ============
function renderMatches() {
    const container = document.getElementById('matchesContainer');
    container.innerHTML = '';
    
    // Agrupar por rondas
    const rounds = {};
    groupMatches.forEach(match => {
        if (!rounds[match.round]) rounds[match.round] = [];
        rounds[match.round].push(match);
    });
    
    Object.keys(rounds).forEach(round => {
        container.innerHTML += `
            <div class="round-container">
                <div class="round-header">📅 Ronda ${round} (Partidos simultáneos)</div>
                <div class="matches-grid">
        `;
        
        rounds[round].forEach(match => {
            container.innerHTML += `
                <div class="match-card">
                    <span class="venue-badge">🏟️ ${match.venue}</span>
                    <small style="display: block; color: #666; margin-bottom: 8px;">${match.groupName}</small>
                    <div class="team-row">
                        <span class="team-name">${match.team1}</span>
                        <input type="number" class="score-input" placeholder="0" 
                               value="${match.score1 ?? ''}"
                               onchange="updateMatchScore(${match.id}, 1, this.value)">
                    </div>
                    <div class="team-row">
                        <span class="team-name">${match.team2}</span>
                        <input type="number" class="score-input" placeholder="0" 
                               value="${match.score2 ?? ''}"
                               onchange="updateMatchScore(${match.id}, 2, this.value)">
                    </div>
                    ${match.winner ? `<span class="winner-badge">✅ ${match.winner}</span>` : ''}
                </div>
            `;
        });
        
        container.innerHTML += '</div></div>';
    });
}

// ============ ACTUALIZAR MARCADOR ============
function updateMatchScore(matchId, teamNumber, score) {
    const match = groupMatches.find(m => m.id === matchId);
    if (!match) return;
    
    if (teamNumber === 1) {
        match.score1 = parseInt(score) || 0;
    } else {
        match.score2 = parseInt(score) || 0;
    }
    
    if (match.score1 !== null && match.score2 !== null) {
        if (match.score1 > match.score2) {
            match.winner = match.team1;
        } else if (match.score2 > match.score1) {
            match.winner = match.team2;
        } else {
            match.winner = 'Empate';
        }
        match.status = 'completed';
        
        updateStandings(match);
        checkAndPopulateKnockout();
    }
    
    renderMatches();
    renderStandings();
    renderBrackets();
}

// ============ ACTUALIZAR TABLA ============
function updateStandings(match) {
    const groupStandings = standings[match.groupId];
    if (!groupStandings) return;
    
    const updateTeam = (teamName, result, gf, ga) => {
        const stats = groupStandings[teamName];
        if (!stats) return;
        
        stats.played++;
        stats.goalsFor += gf;
        stats.goalsAgainst += ga;
        stats.goalDiff = stats.goalsFor - stats.goalsAgainst;
        
        if (result === 'win') {
            stats.wins++;
            stats.points += 3;
        } else if (result === 'loss') {
            stats.losses++;
        } else {
            stats.draws++;
            stats.points += 1;
        }
    };
    
    if (match.winner === match.team1) {
        updateTeam(match.team1, 'win', match.score1, match.score2);
        updateTeam(match.team2, 'loss', match.score2, match.score1);
    } else if (match.winner === match.team2) {
        updateTeam(match.team2, 'win', match.score2, match.score1);
        updateTeam(match.team1, 'loss', match.score1, match.score2);
    } else {
        updateTeam(match.team1, 'draw', match.score1, match.score2);
        updateTeam(match.team2, 'draw', match.score2, match.score1);
    }
}

// ============ RENDERIZAR TABLAS ============
function renderStandings() {
    const container = document.getElementById('standingsContainer');
    container.innerHTML = '';
    
    groups.forEach((group, groupIndex) => {
        const groupStandings = standings[group.id];
        if (!groupStandings) return;
        
        const sortedTeams = Object.entries(groupStandings)
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor);
        
        container.innerHTML += `
            <h3 class="colors-${groupIndex % 8}" style="padding: 10px; margin: 20px 0 10px 0; border-radius: 5px;">
                ${group.name}
            </h3>
            <table>
                <thead>
                    <tr>
                        <th>Pos</th>
                        <th>Equipo</th>
                        <th>PJ</th>
                        <th>PG</th>
                        <th>PE</th>
                        <th>PP</th>
                        <th>GF</th>
                        <th>GC</th>
                        <th>DG</th>
                        <th>Pts</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedTeams.map((team, idx) => `
                        <tr class="position-${idx + 1}">
                            <td><strong>${idx + 1}</strong></td>
                            <td>${team.name}</td>
                            <td>${team.played}</td>
                            <td>${team.wins}</td>
                            <td>${team.draws}</td>
                            <td>${team.losses}</td>
                            <td>${team.goalsFor}</td>
                            <td>${team.goalsAgainst}</td>
                            <td>${team.goalDiff > 0 ? '+' : ''}${team.goalDiff}</td>
                            <td><strong>${team.points}</strong></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    });
}

// ============ VERIFICAR Y POBLAR ELIMINATORIAS ============
function checkAndPopulateKnockout() {
    const allCompleted = groupMatches.every(m => m.status === 'completed');
    
    if (allCompleted && knockoutBrackets.length > 0) {
        currentPhase = 'knockout';
        
        const qualified = [];
        
        groups.forEach(group => {
            const groupStandings = standings[group.id];
            if (!groupStandings) return;
            
            const sortedTeams = Object.entries(groupStandings)
                .map(([name, stats]) => ({ name, ...stats }))
                .sort((a, b) => b.points - a.points);
            
            if (sortedTeams.length >= 2) {
                qualified.push(sortedTeams[0].name);
                qualified.push(sortedTeams[1].name);
            }
        });
        
        const firstRound = knockoutBrackets[0];
        firstRound.forEach((match, index) => {
            if (index * 2 < qualified.length) {
                match.team1 = qualified[index * 2] || 'TBD';
                match.team2 = qualified[index * 2 + 1] || 'TBD';
                match.status = 'ready';
            }
        });
        
        renderPhaseDiagram();
    }
}

// ============ RENDERIZAR ELIMINATORIAS ============
function renderBrackets() {
    const container = document.getElementById('bracketContainer');
    container.innerHTML = '<div class="bracket-diagram">';
    
    knockoutBrackets.forEach((round, index) => {
        container.innerHTML += `
            <div class="bracket-column">
                <div class="bracket-round-title">${round[0]?.roundName || 'Ronda ' + (index + 1)}</div>
        `;
        
        round.forEach(match => {
            container.innerHTML += `
                <div class="bracket-match">
                    <small style="color: #666;">🏟️ ${match.venue}</small>
                    <div class="team-row">
                        <span class="team-name">${match.team1 || 'Por definir'}</span>
                        <input type="number" class="score-input" placeholder="0" 
                               value="${match.score1 ?? ''}"
                               onchange="updateKnockoutScore(${match.id}, 1, this.value)">
                    </div>
                    <div class="team-row">
                        <span class="team-name">${match.team2 || 'Por definir'}</span>
                        <input type="number" class="score-input" placeholder="0" 
                               value="${match.score2 ?? ''}"
                               onchange="updateKnockoutScore(${match.id}, 2, this.value)">
                    </div>
                    ${match.winner ? `<span class="winner-badge">✅ ${match.winner}</span>` : ''}
                </div>
            `;
        });
        
        container.innerHTML += '</div>';
    });
    
    container.innerHTML += '</div>';
}

// ============ ACTUALIZAR MARCADOR ELIMINATORIA ============
function updateKnockoutScore(matchId, teamNumber, score) {
    let match = null;
    let roundIndex = -1;
    let matchIndex = -1;
    
    knockoutBrackets.forEach((round, rIdx) => {
        round.forEach((m, mIdx) => {
            if (m.id === matchId) {
                match = m;
                roundIndex = rIdx;
                matchIndex = mIdx;
            }
        });
    });
    
    if (!match) return;
    
    if (teamNumber === 1) {
        match.score1 = parseInt(score) || 0;
    } else {
        match.score2 = parseInt(score) || 0;
    }
    
    if (match.score1 !== null && match.score2 !== null && match.team1 && match.team2) {
        if (match.score1 > match.score2) {
            match.winner = match.team1;
        } else if (match.score2 > match.score1) {
            match.winner = match.team2;
        }
        match.status = 'completed';
        
        if (roundIndex + 1 < knockoutBrackets.length) {
            const nextRound = knockoutBrackets[roundIndex + 1];
            const nextMatchIndex = Math.floor(matchIndex / 2);
            
            if (nextRound[nextMatchIndex]) {
                if (matchIndex % 2 === 0) {
                    nextRound[nextMatchIndex].team1 = match.winner;
                } else {
                    nextRound[nextMatchIndex].team2 = match.winner;
                }
            }
        } else {
            currentPhase = 'finished';
            showNotification('🏆 ¡' + match.winner + ' es el Campeón!');
            renderPhaseDiagram();
        }
    }
    
    renderBrackets();
}

// ============ NOTIFICACIONES ============
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = 'notification';
    notification.style.borderLeftColor = type === 'error' ? '#ef4444' : '#10b981';
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

// ============ GUARDAR DATOS ============
function saveData() {
    const data = {
        teams, groups, groupMatches, knockoutBrackets, standings,
        numTeams, numGroups, numVenues, currentPhase
    };
    
    localStorage.setItem('torneoData', JSON.stringify(data));
    showNotification('💾 Datos guardados');
}

// ============ CARGAR DATOS ============
function loadData() {
    const saved = localStorage.getItem('torneoData');
    
    if (saved) {
        const data = JSON.parse(saved);
        
        teams = data.teams || [];
        groups = data.groups || [];
        groupMatches = data.groupMatches || [];
        knockoutBrackets = data.knockoutBrackets || [];
        standings = data.standings || {};
        numTeams = data.numTeams || 8;
        numGroups = data.numGroups || 2;
        numVenues = data.numVenues || 3;
        currentPhase = data.currentPhase || 'groups';
        
        document.getElementById('numTeams').value = numTeams;
        document.getElementById('numGroups').value = numGroups;
        document.getElementById('numVenues').value = numVenues;
        
        generateTeamInputs();
        
        teams.forEach((team, index) => {
            const input = document.getElementById('team_' + index);
            if (input) input.value = team;
        });
        
        document.getElementById('phaseDiagramSection').classList.remove('hidden');
        document.getElementById('groupsSection').classList.remove('hidden');
        document.getElementById('matchesSection').classList.remove('hidden');
        document.getElementById('standingsSection').classList.remove('hidden');
        document.getElementById('knockoutSection').classList.remove('hidden');
        
        renderPhaseDiagram();
        renderGroups();
        renderMatches();
        renderStandings();
        renderBrackets();
        
        showNotification('📂 Datos cargados');
    } else {
        showNotification('No hay datos guardados', 'error');
    }
}
