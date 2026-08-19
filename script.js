// Estado global
let tournamentData = {
    sport: 'football',
    format: 'auto',
    numParticipants: 16,
    numGroups: 4,
    numVenues: 3,
    matchDuration: 30,
    tiebreaker: 'points',
    participants: [],
    groups: [],
    groupMatches: [],
    knockoutMatches: [],
    groupStandings: new Map(),
    knockoutBrackets: [],
    venues: [],
    qualifiedTeams: [],
    isIndividual: false
};

// Información de deportes
const sportInfo = {
    football: { type: 'team', name: 'Fútbol', icon: '⚽', recommendedFormat: 'groups_knockout' },
    basketball: { type: 'team', name: 'Baloncesto', icon: '🏀', recommendedFormat: 'groups_knockout' },
    volleyball: { type: 'team', name: 'Voleibol', icon: '🏐', recommendedFormat: 'groups_knockout' },
    handball: { type: 'team', name: 'Balonmano', icon: '🤾', recommendedFormat: 'groups_knockout' },
    esports_team: { type: 'team', name: 'eSports (Equipos)', icon: '🎮', recommendedFormat: 'groups_knockout' },
    tennis: { type: 'individual', name: 'Tenis', icon: '🎾', recommendedFormat: 'single_elimination' },
    chess: { type: 'individual', name: 'Ajedrez', icon: '♟️', recommendedFormat: 'swiss' },
    padel: { type: 'individual', name: 'Pádel', icon: '🏸', recommendedFormat: 'double_elimination' },
    table_tennis: { type: 'individual', name: 'Tenis de Mesa', icon: '🏓', recommendedFormat: 'single_elimination' },
    esports_individual: { type: 'individual', name: 'eSports (Individual)', icon: '🎮', recommendedFormat: 'double_elimination' }
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    loadExample();
    updateTeamCount();
    onSportChange();
    
    const saved = localStorage.getItem('tournamentDataV4');
    if (saved) {
        showNotification('Torneo guardado encontrado', 'success');
    }
});

// Mostrar notificaciones
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 4000);
}

// Cambio de deporte
function onSportChange() {
    const sport = document.getElementById('sportSelect').value;
    const info = sportInfo[sport];
    
    tournamentData.isIndividual = info.type === 'individual';
    
    // Actualizar header
    const header = document.querySelector('.main-header h1');
    header.textContent = `${info.icon} Gestor de Torneos Profesional`;
    
    // Actualizar formato recomendado
    const formatSelect = document.getElementById('formatSelect');
    formatSelect.value = 'auto';
    
    // Mostrar información
    const formatInfo = document.getElementById('formatInfo');
    if (tournamentData.isIndividual) {
        formatInfo.innerHTML = `
            <strong>${info.name} (Individual)</strong><br>
            Recomendado: Sistema de llaves con posible muerte súbita.<br>
            Formatos ideales: Eliminación Directa o Suizo.
        `;
    } else {
        formatInfo.innerHTML = `
            <strong>${info.name} (Colectivo)</strong><br>
            Recomendado: Fase de grupos + eliminatorias.<br>
            Formatos ideales: Grupos + Llaves o Round-Robin.
        `;
    }
    
    updateRecommendations();
}

// Cambio de formato
function onFormatChange() {
    const format = document.getElementById('formatSelect').value;
    updateRecommendations();
}

// Actualizar recomendaciones
function updateRecommendations() {
    const numParticipants = parseInt(document.getElementById('numParticipants').value) || 16;
    const numGroups = parseInt(document.getElementById('numGroups').value) || 4;
    const sport = document.getElementById('sportSelect').value;
    const info = sportInfo[sport];
    
    // Información de participantes
    const participantsInfo = document.getElementById('participantsInfo');
    if (numParticipants < 4) {
        participantsInfo.className = 'format-info warning';
        participantsInfo.innerHTML = '⚠️ Se recomiendan al menos 4 participantes';
    } else if (numParticipants > 32 && info.type === 'team') {
        participantsInfo.className = 'format-info warning';
        participantsInfo.innerHTML = '⚠️ Para equipos, se recomienda máximo 32 equipos';
    } else {
        participantsInfo.className = 'format-info success';
        participantsInfo.innerHTML = `✅ ${numParticipants} participantes es un número válido`;
    }
    
    // Información de grupos
    const groupsInfo = document.getElementById('groupsInfo');
    if (numGroups > 1 && numParticipants % numGroups !== 0) {
        groupsInfo.className = 'format-info warning';
        const remainder = numParticipants % numGroups;
        groupsInfo.innerHTML = `⚠️ ${numParticipants} participantes en ${numGroups} grupos: ${Math.floor(numParticipants / numGroups)} por grupo, ${remainder} grupos con descanso`;
    } else if (numGroups === 1) {
        groupsInfo.className = 'format-info';
        groupsInfo.innerHTML = 'ℹ️ Un solo grupo: Round-Robin o Sistema Suizo';
    } else {
        groupsInfo.className = 'format-info success';
        groupsInfo.innerHTML = `✅ ${numParticipants} participantes en ${numGroups} grupos de ${numParticipants / numGroups}`;
    }
}

// Actualizar contador de equipos
function updateTeamCount() {
    const participants = document.getElementById('participantsList').value
        .split('\n')
        .map(name => name.trim())
        .filter(name => name !== '');
    
    const countDiv = document.getElementById('teamCount');
    countDiv.innerHTML = `Equipos ingresados: <strong>${participants.length}</strong>`;
    
    // Actualizar campo numérico
    document.getElementById('numParticipants').value = participants.length || 16;
}

// Generar torneo completo
function generateTournament() {
    try {
        // Obtener configuración
        tournamentData.sport = document.getElementById('sportSelect').value;
        tournamentData.format = document.getElementById('formatSelect').value;
        tournamentData.numParticipants = parseInt(document.getElementById('numParticipants').value);
        tournamentData.numGroups = parseInt(document.getElementById('numGroups').value);
        tournamentData.numVenues = parseInt(document.getElementById('numVenues').value);
        tournamentData.matchDuration = parseInt(document.getElementById('matchDuration').value);
        tournamentData.tiebreaker = document.getElementById('tiebreakerSelect').value;
        
        // Obtener participantes
        const participantsText = document.getElementById('participantsList').value;
        tournamentData.participants = participantsText
            .split('\n')
            .map(name => name.trim())
            .filter(name => name !== '');
        
        // Validaciones
        if (tournamentData.participants.length < 2) {
            showNotification('Error: Se necesitan al menos 2 participantes', 'error');
            return;
        }
        
        // Crear canchas
        tournamentData.venues = [];
        for (let i = 1; i <= tournamentData.numVenues; i++) {
            tournamentData.venues.push(`Cancha ${i}`);
        }
        
        // Determinar formato automático
        if (tournamentData.format === 'auto') {
            const info = sportInfo[tournamentData.sport];
            tournamentData.format = info.recommendedFormat;
        }
        
        // Generar según formato
        switch (tournamentData.format) {
            case 'groups_knockout':
                generateGroupsKnockout();
                break;
            case 'single_elimination':
                generateSingleElimination();
                break;
            case 'double_elimination':
                generateDoubleElimination();
                break;
            case 'round_robin':
                generateRoundRobin();
                break;
            case 'swiss':
                generateSwiss();
                break;
        }
        
        // Mostrar secciones
        document.getElementById('dashboardSection').classList.remove('hidden');
        document.getElementById('groupsPhaseSection').classList.remove('hidden');
        document.getElementById('knockoutSection').classList.remove('hidden');
        document.getElementById('matchesSection').classList.remove('hidden');
        
        // Renderizar
        updateDashboard();
        renderGroups();
        renderGroupMatches();
        renderGroupStandings();
        renderQualifiedTeams();
        renderKnockoutBrackets();
        renderAllMatches();
        
        showNotification('Torneo generado exitosamente', 'success');
        
    } catch (error) {
        console.error('Error al generar torneo:', error);
        showNotification('Error al generar el torneo: ' + error.message, 'error');
    }
}

// Generar Grupos + Eliminatorias
function generateGroupsKnockout() {
    distributeToGroups();
    generateGroupPhase();
    generateKnockoutPhase();
}

// Generar Eliminación Directa
function generateSingleElimination() {
    tournamentData.groups = [{
        id: 0,
        name: 'Todos',
        participants: [...tournamentData.participants]
    }];
    
    tournamentData.groupMatches = [];
    tournamentData.groupStandings = new Map();
    
    // Generar bracket directo
    generateKnockoutPhase();
}

// Generar Doble Eliminación
function generateDoubleElimination() {
    generateSingleElimination();
    // Agregar bracket de perdedores
}

// Generar Round-Robin
function generateRoundRobin() {
    if (tournamentData.numGroups > 1) {
        distributeToGroups();
        generateGroupPhase();
    } else {
        tournamentData.groups = [{
            id: 0,
            name: 'Todos',
            participants: [...tournamentData.participants]
        }];
        generateGroupPhase();
    }
}

// Generar Sistema Suizo
function generateSwiss() {
    tournamentData.groups = [{
        id: 0,
        name: 'Todos',
        participants: [...tournamentData.participants]
    }];
    generateGroupPhase();
}

// Distribuir equipos en grupos
function distributeToGroups() {
    tournamentData.groups = [];
    const shuffled = [...tournamentData.participants].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < tournamentData.numGroups; i++) {
        tournamentData.groups.push({
            id: i,
            name: `Grupo ${String.fromCharCode(65 + i)}`,
            participants: []
        });
    }
    
    shuffled.forEach((participant, index) => {
        const groupIndex = index % tournamentData.numGroups;
        tournamentData.groups[groupIndex].participants.push(participant);
    });
}

// Generar fase de grupos
function generateGroupPhase() {
    tournamentData.groupMatches = [];
    tournamentData.groupStandings = new Map();
    
    let matchId = 1;
    
    tournamentData.groups.forEach(group => {
        const participants = group.participants;
        const standings = new Map();
        
        participants.forEach(p => {
            standings.set(p, {
                points: 0, played: 0, wins: 0, draws: 0, losses: 0,
                goalsFor: 0, goalsAgainst: 0, goalDifference: 0
            });
        });
        
        tournamentData.groupStandings.set(group.id, standings);
        
        // Generar partidos (Round-Robin dentro del grupo)
        const teams = [...participants];
        if (teams.length % 2 !== 0) {
            teams.push('BYE');
        }
        
        const numRounds = teams.length - 1;
        const numMatchesPerRound = teams.length / 2;
        
        for (let round = 0; round < numRounds; round++) {
            for (let match = 0; match < numMatchesPerRound; match++) {
                const home = teams[match];
                const away = teams[teams.length - 1 - match];
                
                if (home !== 'BYE' && away !== 'BYE') {
                    const matchObj = {
                        id: matchId,
                        phase: 'group',
                        groupId: group.id,
                        groupName: group.name,
                        round: round + 1,
                        participant1: home,
                        participant2: away,
                        score1: null,
                        score2: null,
                        winner: null,
                        venue: tournamentData.venues[(matchId - 1) % tournamentData.numVenues],
                        status: 'scheduled'
                    };
                    tournamentData.groupMatches.push(matchObj);
                    matchId++;
                }
            }
            
            // Rotar equipos
            const last = teams.pop();
            teams.splice(1, 0, last);
        }
    });
}

// Generar fase eliminatoria
function generateKnockoutPhase() {
    tournamentData.knockoutMatches = [];
    tournamentData.knockoutBrackets = [];
    
    const totalQualified = tournamentData.numGroups > 1 ? 
        tournamentData.numGroups * 2 : 
        Math.pow(2, Math.ceil(Math.log2(tournamentData.participants.length)));
    
    const numRounds = Math.log2(totalQualified);
    
    let matchId = tournamentData.groupMatches.length + 1;
    
    const roundNames = {
        1: 'Dieciseisavos de Final',
        2: 'Octavos de Final',
        3: 'Cuartos de Final',
        4: 'Semifinales',
        5: 'Final'
    };
    
    for (let round = 1; round <= numRounds; round++) {
        const matchesInRound = totalQualified / Math.pow(2, round);
        const roundMatches = [];
        
        for (let i = 0; i < matchesInRound; i++) {
            const match = {
                id: matchId,
                phase: 'knockout',
                round: round,
                roundName: roundNames[round] || `Ronda ${round}`,
                participant1: null,
                participant2: null,
                score1: null,
                score2: null,
                winner: null,
                venue: tournamentData.venues[(matchId - 1) % tournamentData.numVenues],
                status: 'pending'
            };
            roundMatches.push(match);
            matchId++;
        }
        
        tournamentData.knockoutBrackets.push(roundMatches);
    }
}

// Actualizar dashboard
function updateDashboard() {
    const totalMatches = tournamentData.groupMatches.length + tournamentData.knockoutBrackets.flat().length;
    const playedMatches = tournamentData.groupMatches.filter(m => m.status === 'completed').length;
    const totalTime = totalMatches * tournamentData.matchDuration / 60;
    
    document.getElementById('statParticipants').textContent = tournamentData.participants.length;
    document.getElementById('statGroups').textContent = tournamentData.numGroups;
    document.getElementById('statTotalMatches').textContent = totalMatches;
    document.getElementById('statPlayed').textContent = playedMatches;
    document.getElementById('statTime').textContent = `${Math.ceil(totalTime)}h`;
}

// Renderizar grupos
function renderGroups() {
    const container = document.getElementById('groupsContainer');
    container.innerHTML = '<div class="groups-grid">';
    
    tournamentData.groups.forEach((group, index) => {
        container.innerHTML += `
            <div class="group-card">
                <div class="group-title group-bg-${index % 8}">
                    ${group.name}
                </div>
                <div class="group-teams">
                    ${group.participants.map(team => 
                        `<div class="group-team">
                            <span>${team}</span>
                            <span class="badge">${index + 1}</span>
                        </div>`
                    ).join('')}
                </div>
            </div>
        `;
    });
    
    container.innerHTML += '</div>';
}

// Renderizar partidos de grupos
function renderGroupMatches() {
    const container = document.getElementById('groupMatchesContainer');
    container.innerHTML = '<h3>📅 Fixture de Fase de Grupos</h3>';
    
    if (tournamentData.groupMatches.length === 0) {
        container.innerHTML += '<p>No hay partidos de grupos (formato de eliminación directa)</p>';
        return;
    }
    
    const rounds = {};
    tournamentData.groupMatches.forEach(match => {
        const key = `Fecha ${match.round}`;
        if (!rounds[key]) rounds[key] = [];
        rounds[key].push(match);
    });
    
    Object.keys(rounds).forEach((round, roundIndex) => {
        const roundDiv = document.createElement('div');
        roundDiv.className = 'match-round';
        roundDiv.innerHTML = `<div class="round-title">${round}</div>`;
        
        const matchesDiv = document.createElement('div');
        matchesDiv.className = 'matches-container';
        matchesDiv.dataset.round = roundIndex + 1;
        
        rounds[round].forEach(match => {
            const matchCard = document.createElement('div');
            matchCard.className = 'match-card';
            matchCard.dataset.matchId = match.id;
            matchCard.innerHTML = `
                <span class="match-group-badge group-bg-${match.groupId % 8}">${match.groupName}</span>
                <span class="match-venue">🏟️ ${match.venue}</span>
                <div class="match-teams">
                    <div class="team-row">
                        <span class="team-name">${match.participant1}</span>
                        <input type="number" class="team-score" 
                               placeholder="0" 
                               value="${match.score1 ?? ''}"
                               onchange="updateGroupScore(${match.id}, 1, this.value)">
                    </div>
                    <div class="team-row">
                        <span class="team-name">${match.participant2}</span>
                        <input type="number" class="team-score" 
                               placeholder="0" 
                               value="${match.score2 ?? ''}"
                               onchange="updateGroupScore(${match.id}, 2, this.value)">
                    </div>
                    ${match.winner ? `<span class="winner-badge">✅ Ganador: ${match.winner}</span>` : ''}
                </div>
            `;
            matchesDiv.appendChild(matchCard);
        });
        
        roundDiv.appendChild(matchesDiv);
        container.appendChild(roundDiv);
    });
}

// Actualizar marcador de fase de grupos
function updateGroupScore(matchId, teamNumber, score) {
    const match = tournamentData.groupMatches.find(m => m.id === matchId);
    if (!match) return;
    
    if (teamNumber === 1) {
        match.score1 = parseInt(score) || 0;
    } else {
        match.score2 = parseInt(score) || 0;
    }
    
    if (match.score1 !== null && match.score2 !== null) {
        if (match.score1 > match.score2) {
            match.winner = match.participant1;
        } else if (match.score2 > match.score1) {
            match.winner = match.participant2;
        } else {
            match.winner = 'draw';
        }
        match.status = 'completed';
        
        updateGroupStandings(match);
        updateDashboard();
        checkAndPopulateKnockout();
    }
    
    renderGroupMatches();
    renderGroupStandings();
    renderQualifiedTeams();
    renderKnockoutBrackets();
}

// Actualizar clasificación del grupo
function updateGroupStandings(match) {
    const standings = tournamentData.groupStandings.get(match.groupId);
    if (!standings) return;
    
    const updateStats = (teamName, result, gf, ga) => {
        const stats = standings.get(teamName);
        if (!stats) return;
        
        stats.played++;
        stats.goalsFor += gf;
        stats.goalsAgainst += ga;
        stats.goalDifference = stats.goalsFor - stats.goalsAgainst;
        
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
    
    if (match.winner === match.participant1) {
        updateStats(match.participant1, 'win', match.score1, match.score2);
        updateStats(match.participant2, 'loss', match.score2, match.score1);
    } else if (match.winner === match.participant2) {
        updateStats(match.participant2, 'win', match.score2, match.score1);
        updateStats(match.participant1, 'loss', match.score1, match.score2);
    } else {
        updateStats(match.participant1, 'draw', match.score1, match.score2);
        updateStats(match.participant2, 'draw', match.score2, match.score1);
    }
}

// Renderizar tablas por grupo
function renderGroupStandings() {
    const container = document.getElementById('groupStandingsContainer');
    container.innerHTML = '<h3>📊 Tablas de Posiciones por Grupo</h3>';
    
    if (tournamentData.groupStandings.size === 0) {
        container.innerHTML += '<p>No hay clasificación (formato de eliminación directa)</p>';
        return;
    }
    
    tournamentData.groups.forEach((group, index) => {
        const standings = tournamentData.groupStandings.get(group.id);
        if (!standings) return;
        
        const sortedTeams = Array.from(standings.entries())
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
                return b.goalsFor - a.goalsFor;
            });
        
        container.innerHTML += `
            <div class="group-standings">
                <div class="group-title group-bg-${index % 8}">${group.name}</div>
                <table class="standings-table">
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
                            <tr class="${idx < 2 ? 'position-qualified' : ''}">
                                <td><strong>${idx + 1}</strong></td>
                                <td>${team.name}</td>
                                <td>${team.played}</td>
                                <td>${team.wins}</td>
                                <td>${team.draws}</td>
                                <td>${team.losses}</td>
                                <td>${team.goalsFor}</td>
                                <td>${team.goalsAgainst}</td>
                                <td>${team.goalDifference > 0 ? '+' : ''}${team.goalDifference}</td>
                                <td><strong>${team.points}</strong></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    });
}

// Verificar y poblar eliminatorias
function checkAndPopulateKnockout() {
    const allGroupMatchesCompleted = tournamentData.groupMatches.every(m => m.status === 'completed');
    
    if (allGroupMatchesCompleted && tournamentData.knockoutBrackets.length > 0) {
        const matchups = getQualifiedTeams();
        
        const firstRound = tournamentData.knockoutBrackets[0];
        firstRound.forEach((match, index) => {
            if (matchups[index]) {
                match.participant1 = matchups[index].participant1;
                match.participant2 = matchups[index].participant2;
                match.status = 'scheduled';
            }
        });
    }
}

// Obtener clasificados
function getQualifiedTeams() {
    const qualified = [];
    
    tournamentData.groupStandings.forEach((standings, groupId) => {
        const group = tournamentData.groups.find(g => g.id === groupId);
        const sortedTeams = Array.from(standings.entries())
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor);
        
        if (sortedTeams.length >= 2) {
            qualified.push({
                participant1: sortedTeams[0].name,
                participant2: sortedTeams[1].name
            });
        }
    });
    
    return qualified;
}

// Renderizar equipos clasificados
function renderQualifiedTeams() {
    const container = document.getElementById('qualifiedTeamsContainer');
    container.innerHTML = '<h3>✅ Equipos Clasificados a Eliminatorias</h3><div class="qualified-grid">';
    
    tournamentData.groupStandings.forEach((standings, groupId) => {
        const group = tournamentData.groups.find(g => g.id === groupId);
        const sortedTeams = Array.from(standings.entries())
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor);
        
        if (sortedTeams.length >= 2) {
            container.innerHTML += `
                <div class="qualified-card">
                    <strong>${group.name}</strong><br>
                    🥇 ${sortedTeams[0].name} (${sortedTeams[0].points} pts)<br>
                    🥈 ${sortedTeams[1].name} (${sortedTeams[1].points} pts)
                </div>
            `;
        }
    });
    
    container.innerHTML += '</div>';
}

// Renderizar brackets de eliminatoria
function renderKnockoutBrackets() {
    const container = document.getElementById('bracketContainer');
    container.innerHTML = '';
    
    tournamentData.knockoutBrackets.forEach((round, index) => {
        container.innerHTML += `
            <div class="bracket-round">
                <div class="round-header">
                    <h3>${round[0]?.roundName || 'Ronda ' + (index + 1)}</h3>
                </div>
        `;
        
        round.forEach(match => {
            container.innerHTML += `
                <div class="match-card">
                    <span class="match-venue">🏟️ ${match.venue}</span>
                    <div class="match-teams">
                        <div class="team-row">
                            <span class="team-name">${match.participant1 || 'Por definir'}</span>
                            <input type="number" class="team-score" 
                                   placeholder="0" 
                                   value="${match.score1 ?? ''}"
                                   onchange="updateKnockoutScore(${match.id}, 1, this.value)">
                        </div>
                        <div class="team-row">
                            <span class="team-name">${match.participant2 || 'Por definir'}</span>
                            <input type="number" class="team-score" 
                                   placeholder="0" 
                                   value="${match.score2 ?? ''}"
                                   onchange="updateKnockoutScore(${match.id}, 2, this.value)">
                        </div>
                        ${match.winner ? `<span class="winner-badge">✅ Ganador: ${match.winner}</span>` : ''}
                    </div>
                </div>
            `;
        });
        
        container.innerHTML += '</div>';
    });
}

// Actualizar marcador de eliminatoria
function updateKnockoutScore(matchId, teamNumber, score) {
    let match = null;
    let roundIndex = -1;
    let matchIndex = -1;
    
    tournamentData.knockoutBrackets.forEach((round, rIdx) => {
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
    
    if (match.score1 !== null && match.score2 !== null && match.participant1 && match.participant2) {
        if (match.score1 > match.score2) {
            match.winner = match.participant1;
        } else if (match.score2 > match.score1) {
            match.winner = match.participant2;
        }
        match.status = 'completed';
        
        if (roundIndex + 1 < tournamentData.knockoutBrackets.length) {
            const nextRound = tournamentData.knockoutBrackets[roundIndex + 1];
            const nextMatchIndex = Math.floor(matchIndex / 2);
            const nextMatch = nextRound[nextMatchIndex];
            
            if (matchIndex % 2 === 0) {
                nextMatch.participant1 = match.winner;
            } else {
                nextMatch.participant2 = match.winner;
            }
        } else {
            showNotification(`🏆 ¡${match.winner} es el Campeón!`, 'success');
        }
    }
    
    updateDashboard();
    renderKnockoutBrackets();
    renderAllMatches();
}

// Renderizar todos los partidos
function renderAllMatches() {
    const container = document.getElementById('matchesContainer');
    container.innerHTML = '<h3>📅 Calendario Completo</h3>';
    
    container.innerHTML += '<h4>Fase de Grupos</h4>';
    tournamentData.groupMatches.forEach(match => {
        container.innerHTML += `
            <div class="match-card">
                <span class="match-group-badge group-bg-${match.groupId % 8}">${match.groupName}</span>
                <span>Fecha ${match.round}</span>
                <span class="match-venue">🏟️ ${match.venue}</span>
                <div class="team-row">
                    <span>${match.participant1} ${match.score1 ?? '-'} vs ${match.score2 ?? '-'} ${match.participant2}</span>
                </div>
            </div>
        `;
    });
    
    container.innerHTML += '<h4>Fase Eliminatoria</h4>';
    tournamentData.knockoutBrackets.forEach(round => {
        round.forEach(match => {
            container.innerHTML += `
                <div class="match-card">
                    <span>${match.roundName}</span>
                    <span class="match-venue">🏟️ ${match.venue}</span>
                    <div class="team-row">
                        <span>${match.participant1 || 'Por definir'} ${match.score1 ?? '-'} vs ${match.score2 ?? '-'} ${match.participant2 || 'Por definir'}</span>
                    </div>
                </div>
            `;
        });
    });
}

// Exportar PDF
function exportPDF(section) {
    let element = null;
    let filename = '';
    
    switch(section) {
        case 'groups':
            element = document.getElementById('groupsPhaseSection');
            filename = 'fase-grupos.pdf';
            break;
        case 'standings':
            element = document.getElementById('groupStandingsContainer');
            filename = 'tablas-posiciones.pdf';
            break;
        case 'bracket':
            element = document.getElementById('knockoutSection');
            filename = 'eliminatorias.pdf';
            break;
        case 'matches':
            element = document.getElementById('matchesSection');
            filename = 'calendario.pdf';
            break;
    }
    
    if (element) {
        html2pdf().from(element).save(filename);
        showNotification(`PDF exportado: ${filename}`, 'success');
    }
}

// Exportar reporte completo
function exportFullReport() {
    const reportHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
            <h1 style="color: #333;">Reporte Completo del Torneo</h1>
            <p>Fecha: ${new Date().toLocaleDateString()}</p>
            <p>Deporte: ${sportInfo[tournamentData.sport].name}</p>
            <p>Formato: ${tournamentData.format}</p>
            ${document.getElementById('groupsPhaseSection').innerHTML}
            ${document.getElementById('knockoutSection').innerHTML}
        </div>
    `;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = reportHTML;
    
    html2pdf().from(tempDiv).save('reporte-completo.pdf');
    showNotification('Reporte completo exportado', 'success');
}

// Guardar estado
function saveTournament() {
    try {
        const dataToSave = {
            ...tournamentData,
            groupStandings: Array.from(tournamentData.groupStandings.entries())
        };
        localStorage.setItem('tournamentDataV4', JSON.stringify(dataToSave));
        showNotification('Torneo guardado correctamente', 'success');
    } catch (error) {
        showNotification('Error al guardar', 'error');
    }
}

// Cargar estado
function loadTournament() {
    try {
        const saved = localStorage.getItem('tournamentDataV4');
        if (saved) {
            const data = JSON.parse(saved);
            tournamentData = {
                ...data,
                groupStandings: new Map(data.groupStandings)
            };
            
            document.getElementById('dashboardSection').classList.remove('hidden');
            document.getElementById('groupsPhaseSection').classList.remove('hidden');
            document.getElementById('knockoutSection').classList.remove('hidden');
            document.getElementById('matchesSection').classList.remove('hidden');
            
            updateDashboard();
            renderGroups();
            renderGroupMatches();
            renderGroupStandings();
            renderQualifiedTeams();
            renderKnockoutBrackets();
            renderAllMatches();
            
            showNotification('Torneo cargado correctamente', 'success');
        } else {
            showNotification('No hay torneo guardado', 'error');
        }
    } catch (error) {
        showNotification('Error al cargar el torneo', 'error');
    }
}

// Cargar ejemplo
function loadExample() {
    const exampleTeams = [
        'Argentina', 'Brasil', 'Francia', 'Alemania',
        'España', 'Inglaterra', 'Portugal', 'Holanda',
        'Italia', 'Bélgica', 'Uruguay', 'Croacia',
        'México', 'Japón', 'Colombia', 'Senegal'
    ];
    
    document.getElementById('participantsList').value = exampleTeams.join('\n');
    document.getElementById('numParticipants').value = 16;
    document.getElementById('numGroups').value = 4;
    document.getElementById('numVenues').value = 3;
    document.getElementById('matchDuration').value = 30;
    updateTeamCount();
    updateRecommendations();
}
