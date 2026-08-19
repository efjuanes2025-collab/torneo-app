// Estado global con gestión robusta
let tournamentData = {
    sport: 'football',
    numGroups: 4,
    teamsPerGroup: 4,
    numVenues: 3,
    participants: [],
    groups: [],
    groupMatches: [],
    knockoutMatches: [],
    groupStandings: new Map(),
    knockoutBrackets: [],
    venues: [],
    qualifiedTeams: []
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    loadExample();
    updateTeamCount();
    
    // Verificar si hay torneo guardado
    const saved = localStorage.getItem('tournamentDataV3');
    if (saved) {
        showNotification('Torneo guardado encontrado', 'success');
    }
});

// Función para mostrar notificaciones
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

// Actualizar contador de equipos
function updateTeamCount() {
    const numGroups = parseInt(document.getElementById('numGroups').value);
    const teamsPerGroup = parseInt(document.getElementById('teamsPerGroup').value);
    const required = numGroups * teamsPerGroup;
    
    const countDiv = document.getElementById('teamCount');
    countDiv.textContent = `Se requieren ${required} equipos (${numGroups} grupos × ${teamsPerGroup} equipos)`;
}

// Actualizar icono de deporte
function updateSportIcon() {
    const sport = document.getElementById('sportSelect').value;
    const header = document.querySelector('.main-header h1');
    
    const icons = {
        football: '⚽',
        basketball: '🏀',
        tennis: '🎾',
        chess: '♟️',
        esports: '🎮'
    };
    
    header.textContent = `${icons[sport]} Gestor de Torneos Profesional`;
}

// Generar torneo completo
function generateTournament() {
    try {
        // Obtener configuración
        tournamentData.sport = document.getElementById('sportSelect').value;
        tournamentData.numGroups = parseInt(document.getElementById('numGroups').value);
        tournamentData.teamsPerGroup = parseInt(document.getElementById('teamsPerGroup').value);
        tournamentData.numVenues = parseInt(document.getElementById('numVenues').value);
        
        // Obtener participantes
        const participantsText = document.getElementById('participantsList').value;
        tournamentData.participants = participantsText
            .split('\n')
            .map(name => name.trim())
            .filter(name => name !== '');
        
        // Validación
        const requiredTeams = tournamentData.numGroups * tournamentData.teamsPerGroup;
        if (tournamentData.participants.length !== requiredTeams) {
            showNotification(
                `Error: Se necesitan exactamente ${requiredTeams} equipos. Actualmente hay ${tournamentData.participants.length}.`,
                'error'
            );
            return;
        }
        
        // Crear canchas
        tournamentData.venues = [];
        for (let i = 1; i <= tournamentData.numVenues; i++) {
            tournamentData.venues.push(`Cancha ${i}`);
        }
        
        // Distribuir en grupos
        distributeToGroups();
        
        // Generar fase de grupos
        generateGroupPhase();
        
        // Generar fase eliminatoria
        generateKnockoutPhase();
        
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
        showNotification('Error al generar el torneo', 'error');
    }
}

// Distribuir equipos en grupos aleatoriamente
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
    
    // Distribución equitativa
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
    const totalRounds = tournamentData.teamsPerGroup - 1;
    
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
        
        // Generar partidos usando método del círculo
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
    
    const totalQualified = tournamentData.numGroups * 2;
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
    
    document.getElementById('statParticipants').textContent = tournamentData.participants.length;
    document.getElementById('statGroups').textContent = tournamentData.numGroups;
    document.getElementById('statPlayed').textContent = playedMatches;
    document.getElementById('statRemaining').textContent = totalMatches - playedMatches;
}

// Renderizar grupos
function renderGroups() {
    const container = document.getElementById('groupsContainer');
    container.innerHTML = '<div class="groups-grid">';
    
    tournamentData.groups.forEach((group, index) => {
        container.innerHTML += `
            <div class="group-card">
                <div class="group-title group-bg-${index}">
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

// Renderizar partidos de grupos con drag & drop
function renderGroupMatches() {
    const container = document.getElementById('groupMatchesContainer');
    container.innerHTML = '<h3>📅 Fixture de Fase de Grupos</h3>';
    
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
                <span class="match-group-badge group-bg-${match.groupId}">${match.groupName}</span>
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
                </div>
            `;
            matchesDiv.appendChild(matchCard);
        });
        
        roundDiv.appendChild(matchesDiv);
        container.appendChild(roundDiv);
    });
    
    // Inicializar drag & drop
    initializeDragAndDrop();
}

// Inicializar drag & drop
function initializeDragAndDrop() {
    const containers = document.querySelectorAll('.matches-container');
    
    containers.forEach(container => {
        new Sortable(container, {
            group: 'matches',
            animation: 150,
            onEnd: function(evt) {
                const matchId = parseInt(evt.item.dataset.matchId);
                const newRound = parseInt(evt.to.dataset.round);
                const match = tournamentData.groupMatches.find(m => m.id === matchId);
                
                if (match) {
                    match.round = newRound;
                    showNotification(`Partido movido a Fecha ${newRound}`, 'success');
                    renderAllMatches();
                }
            }
        });
    });
}

// Actualizar marcador de fase de grupos
function updateGroupScore(matchId, teamNumber, score) {
    const match = tournamentData.groupMatches.find(m => m.id === matchId);
    
    if (teamNumber === 1) {
        match.score1 = parseInt(score) || 0;
    } else {
        match.score2 = parseInt(score) || 0;
    }
    
    if (match.score1 !== null && match.score2 !== null
