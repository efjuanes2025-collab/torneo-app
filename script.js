// ============ VARIABLES GLOBALES ============
let teams = [];
let groups = [];
let groupMatches = [];
let knockoutBrackets = [];
let standings = {};
let numTeams = 8;
let numGroups = 2;
let numVenues = 2;

// ============ INICIALIZACIÓN ============
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema iniciado');
    generateTeamInputs();
});

// ============ GENERAR INPUTS DE EQUIPOS ============
function generateTeamInputs() {
    numTeams = parseInt(document.getElementById('numTeams').value) || 8;
    const container = document.getElementById('teamsInputContainer');
    container.innerHTML = '';
    
    const defaultNames = [
        'Equipo 1', 'Equipo 2', 'Equipo 3', 'Equipo 4',
        'Equipo 5', 'Equipo 6', 'Equipo 7', 'Equipo 8',
        'Equipo 9', 'Equipo 10', 'Equipo 11', 'Equipo 12',
        'Equipo 13', 'Equipo 14', 'Equipo 15', 'Equipo 16'
    ];
    
    for (let i = 0; i < numTeams; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'team_' + i;
        input.value = defaultNames[i] || ('Equipo ' + (i + 1));
        input.style.marginBottom = '8px';
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
    document.getElementById('numVenues').value = 2;
    
    generateTeamInputs();
    
    for (let i = 0; i < exampleTeams.length; i++) {
        const input = document.getElementById('team_' + i);
        if (input) {
            input.value = exampleTeams[i];
        }
    }
    
    showNotification('📋 Ejemplo cargado');
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
    
    // Distribuir en grupos
    distributeToGroups();
    
    // Generar partidos de grupos
    generateGroupMatches();
    
    // Generar eliminatorias
    generateKnockoutBrackets();
    
    // Mostrar secciones
    document.getElementById('groupsSection').classList.remove('hidden');
    document.getElementById('matchesSection').classList.remove('hidden');
    document.getElementById('standingsSection').classList.remove('hidden');
    document.getElementById('knockoutSection').classList.remove('hidden');
    
    // Renderizar
    renderGroups();
    renderMatches();
    renderStandings();
    renderBrackets();
    
    showNotification('✅ Torneo generado correctamente');
}

// ============ DISTRIBUIR EN GRUPOS ============
function distributeToGroups() {
    groups = [];
    standings = {};
    
    // Barajar equipos
    const shuffled = [...teams].sort(() => Math.random() - 0.5);
    
    // Crear grupos
    for (let i = 0; i < numGroups; i++) {
        groups.push({
            id: i,
            name: 'Grupo ' + String.fromCharCode(65 + i),
            teams: []
        });
    }
    
    // Asignar equipos
    shuffled.forEach((team, index) => {
        const groupIndex = index % numGroups;
        groups[groupIndex].teams.push(team);
    });
    
    // Inicializar standings
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

// ============ GENERAR PARTIDOS DE GRUPOS ============
function generateGroupMatches() {
    groupMatches = [];
    let matchId = 1;
    
    groups.forEach(group => {
        const teamsInGroup = group.teams;
        
        // Todos contra todos
        for (let i = 0; i < teamsInGroup.length; i++) {
            for (let j = i + 1; j < teamsInGroup.length; j++) {
                groupMatches.push({
                    id: matchId,
                    groupId: group.id,
                    groupName: group.name,
                    team1: teamsInGroup[i],
                    team2: teamsInGroup[j],
                    score1: null,
                    score2: null,
                    winner: null,
                    venue: 'Cancha ' + ((matchId - 1) % numVenues + 1),
                    status: 'pending'
                });
                matchId++;
            }
        }
    });
}

// ============ GENERAR ELIMINATORIAS ============
function generateKnockoutBrackets() {
    knockoutBrackets = [];
    
    // Número de clasificados (2 por grupo)
    const qualifiedCount = numGroups * 2;
    const numRounds = Math.log2(qualifiedCount);
    
    let matchId = groupMatches.length + 1;
    
    const roundNames = ['', 'Semifinales', 'Final'];
    
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
                venue: 'Cancha ' + ((matchId - 1) % numVenues + 1),
                status: 'pending'
            });
            matchId++;
        }
        
        knockoutBrackets.push(roundMatches);
    }
}

// ============ RENDERIZAR GRUPOS ============
function renderGroups() {
    const container = document.getElementById('groupsContainer');
    container.innerHTML = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">';
    
    groups.forEach((group, index) => {
        container.innerHTML += `
            <div style="background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div class="group-colors-${index % 8}" style="padding: 15px; font-weight: bold; text-align: center;">
                    ${group.name}
                </div>
                <div style="padding: 15px;">
                    ${group.teams.map(team => `<div style="padding: 8px; border-bottom: 1px solid #f0f0f0;">${team}</div>`).join('')}
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
    
    groups.forEach((group, groupIndex) => {
        const groupMatchList = groupMatches.filter(m => m.groupId === group.id);
        
        if (groupMatchList.length > 0) {
            container.innerHTML += `
                <h3 class="group-colors-${groupIndex % 8}" style="padding: 10px; margin: 20px 0 10px 0; border-radius: 5px;">
                    ${group.name}
                </h3>
            `;
            
            groupMatchList.forEach(match => {
                container.innerHTML += `
                    <div class="match-card">
                        <small style="color: #666;">🏟️ ${match.venue}</small>
                        <div class="match-teams" style="margin-top: 10px;">
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
                            ${match.winner ? `<div class="winner">✅ Ganador: ${match.winner}</div>` : ''}
                        </div>
                    </div>
                `;
            });
        }
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
        
        // Actualizar standings
        updateStandings(match);
        
        // Verificar si todos los partidos están completos
        checkAndPopulateKnockout();
    }
    
    // Re-renderizar
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
            <h3 class="group-colors-${groupIndex % 8}" style="padding: 10px; margin: 20px 0 10px 0; border-radius: 5px;">
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
                        <tr>
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
        
        // Poblar primera ronda
        const firstRound = knockoutBrackets[0];
        firstRound.forEach((match, index) => {
            if (index * 2 < qualified.length) {
                match.team1 = qualified[index * 2] || 'TBD';
                match.team2 = qualified[index * 2 + 1] || 'TBD';
                match.status = 'ready';
            }
        });
    }
}

// ============ RENDERIZAR ELIMINATORIAS ============
function renderBrackets() {
    const container = document.getElementById('bracketContainer');
    container.innerHTML = '';
    
    knockoutBrackets.forEach(round => {
        container.innerHTML += `
            <div class="bracket-round">
                <div class="round-title">${round[0]?.roundName || 'Ronda'}</div>
        `;
        
        round.forEach(match => {
            container.innerHTML += `
                <div class="match-card">
                    <small style="color: #666;">🏟️ ${match.venue}</small>
                    <div class="match-teams" style="margin-top: 10px;">
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
                        ${match.winner ? `<div class="winner">✅ ${match.winner}</div>` : ''}
                    </div>
                </div>
            `;
        });
        
        container.innerHTML += '</div>';
    });
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
        
        // Propagar a siguiente ronda
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
            showNotification('🏆 ¡' + match.winner + ' es el Campeón!');
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
        teams: teams,
        groups: groups,
        groupMatches: groupMatches,
        knockoutBrackets: knockoutBrackets,
        standings: standings,
        numTeams: numTeams,
        numGroups: numGroups,
        numVenues: numVenues
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
        numVenues = data.numVenues || 2;
        
        // Actualizar inputs
        document.getElementById('numTeams').value = numTeams;
        document.getElementById('numGroups').value = numGroups;
        document.getElementById('numVenues').value = numVenues;
        
        generateTeamInputs();
        
        teams.forEach((team, index) => {
            const input = document.getElementById('team_' + index);
            if (input) input.value = team;
        });
        
        // Mostrar secciones
        document.getElementById('groupsSection').classList.remove('hidden');
        document.getElementById('matchesSection').classList.remove('hidden');
        document.getElementById('standingsSection').classList.remove('hidden');
        document.getElementById('knockoutSection').classList.remove('hidden');
        
        // Renderizar
        renderGroups();
        renderMatches();
        renderStandings();
        renderBrackets();
        
        showNotification('📂 Datos cargados');
    } else {
        showNotification('No hay datos guardados', 'error');
    }
}
