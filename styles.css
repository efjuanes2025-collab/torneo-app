// Estado global
let tournamentData = {
    sport: '',
    format: '',
    numGroups: 1,
    numVenues: 3,
    participants: [],
    groups: [],
    matches: [],
    standings: new Map(),
    brackets: [],
    venues: []
};

// Generar torneo
function generateTournament() {
    // Obtener datos del formulario
    tournamentData.sport = document.getElementById('sportSelect').value;
    tournamentData.format = document.getElementById('formatSelect').value;
    tournamentData.numGroups = parseInt(document.getElementById('numGroups').value);
    tournamentData.numVenues = parseInt(document.getElementById('numVenues').value);
    
    // Obtener participantes
    const participantsText = document.getElementById('participantsList').value;
    tournamentData.participants = participantsText
        .split('\n')
        .map(name => name.trim())
        .filter(name => name !== '');
    
    if (tournamentData.participants.length < 2) {
        alert('Por favor, ingresa al menos 2 participantes');
        return;
    }
    
    // Crear canchas
    tournamentData.venues = [];
    for (let i = 1; i <= tournamentData.numVenues; i++) {
        tournamentData.venues.push(`Cancha ${i}`);
    }
    
    // Distribuir en grupos si es necesario
    if (tournamentData.numGroups > 1) {
        distributeToGroups();
    } else {
        tournamentData.groups = [{
            id: 1,
            name: 'Grupo Único',
            participants: [...tournamentData.participants]
        }];
    }
    
    // Generar según el formato
    switch (tournamentData.format) {
        case 'single':
            generateSingleElimination();
            break;
        case 'double':
            generateDoubleElimination();
            break;
        case 'roundRobin':
            generateRoundRobin();
            break;
        case 'swiss':
            generateSwiss();
            break;
    }
    
    // Mostrar secciones
    document.getElementById('summarySection').classList.remove('hidden');
    document.getElementById('groupsSection').classList.remove('hidden');
    document.getElementById('bracketSection').classList.remove('hidden');
    document.getElementById('matchesSection').classList.remove('hidden');
    document.getElementById('standingsSection').classList.remove('hidden');
    
    // Renderizar
    renderSummary();
    renderGroups();
    renderBracket();
    renderMatches();
    renderStandings();
}

// Distribuir participantes en grupos
function distributeToGroups() {
    tournamentData.groups = [];
    const shuffled = [...tournamentData.participants].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < tournamentData.numGroups; i++) {
        tournamentData.groups.push({
            id: i + 1,
            name: `Grupo ${String.fromCharCode(65 + i)}`,
            participants: []
        });
    }
    
    shuffled.forEach((participant, index) => {
        const groupIndex = index % tournamentData.numGroups;
        tournamentData.groups[groupIndex].participants.push(participant);
    });
}

// Eliminación Simple
function generateSingleElimination() {
    const numParticipants = tournamentData.participants.length;
    const numRounds = Math.ceil(Math.log2(numParticipants));
    const totalSlots = Math.pow(2, numRounds);
    
    tournamentData.brackets = [];
    tournamentData.matches = [];
    
    let matchNumber = 1;
    const firstRound = [];
    
    for (let i = 0; i < totalSlots; i += 2) {
        const participant1 = tournamentData.participants[i] || 'BYE';
        const participant2 = tournamentData.participants[i + 1] || 'BYE';
        
        const match = {
            id: matchNumber,
            round: 1,
            participant1,
            participant2,
            score1: null,
            score2: null,
            winner: null,
            venue: tournamentData.venues[(matchNumber - 1) % tournamentData.numVenues],
            status: 'scheduled'
        };
        
        firstRound.push(match);
        tournamentData.matches.push(match);
        matchNumber++;
    }
    
    tournamentData.brackets.push(firstRound);
    
    for (let round = 2; round <= numRounds; round++) {
        const numMatches = Math.pow(2, numRounds - round);
        const roundMatches = [];
        
        for (let i = 0; i < numMatches; i++) {
            const match = {
                id: matchNumber,
                round,
                participant1: 'TBD',
                participant2: 'TBD',
                score1: null,
                score2: null,
                winner: null,
                venue: tournamentData.venues[(matchNumber - 1) % tournamentData.numVenues],
                status: 'scheduled'
            };
            
            roundMatches.push(match);
            tournamentData.matches.push(match);
            matchNumber++;
        }
        
        tournamentData.brackets.push(roundMatches);
    }
    
    initializeStandings();
}

// Doble Eliminación
function generateDoubleElimination() {
    generateSingleElimination();
    
    const losersBracket = [];
    const numLosersMatches = tournamentData.participants.length - 1;
    
    for (let i = 0; i < numLosersMatches; i++) {
        losersBracket.push({
            id: tournamentData.matches.length + i + 1,
            round: 1,
            participant1: 'TBD',
            participant2: 'TBD',
            score1: null,
            score2: null,
            winner: null,
            bracket: 'losers',
            venue: tournamentData.venues[i % tournamentData.numVenues],
            status: 'scheduled'
        });
    }
    
    tournamentData.brackets.push(losersBracket);
}

// Round Robin
function generateRoundRobin() {
    tournamentData.brackets = [];
    tournamentData.matches = [];
    
    let matchNumber = 1;
    
    tournamentData.groups.forEach(group => {
        let participants = [...group.participants];
        let numParticipants = participants.length;
        
        if (numParticipants % 2 !== 0) {
            participants.push('BYE');
            numParticipants++;
        }
        
        const numRounds = numParticipants - 1;
        const matchesPerRound = numParticipants / 2;
        
        for (let round = 0; round < numRounds; round++) {
            const roundMatches = [];
            
            for (let match = 0; match < matchesPerRound; match++) {
                const home = participants[match];
                const away = participants[numParticipants - 1 - match];
                
                const matchObj = {
                    id: matchNumber,
                    round: round + 1,
                    group: group.name,
                    participant1: home,
                    participant2: away,
                    score1: null,
                    score2: null,
                    winner: null,
                    venue: tournamentData.venues[(matchNumber - 1) % tournamentData.numVenues],
                    status: 'scheduled',
                    isBye: home === 'BYE' || away === 'BYE'
                };
                
                roundMatches.push(matchObj);
                tournamentData.matches.push(matchObj);
                matchNumber++;
            }
            
            tournamentData.brackets.push(roundMatches);
            
            const last = participants.pop();
            participants.splice(1, 0, last);
        }
    });
    
    initializeStandings();
}

// Sistema Suizo
function generateSwiss() {
    const numParticipants = tournamentData.participants.length;
    const numRounds = Math.ceil(Math.log2(numParticipants));
    
    tournamentData.brackets = [];
    tournamentData.matches = [];
    
    let matchNumber = 1;
    
    for (let round = 1; round <= numRounds; round++) {
        const roundMatches = [];
        const shuffledParticipants = [...tournamentData.participants];
        
        if (round > 1) {
            shuffledParticipants.sort((a, b) => {
                const scoreA = tournamentData.standings.get(a)?.points || 0;
                const scoreB = tournamentData.standings.get(b)?.points || 0;
                return scoreB - scoreA;
            });
        }
        
        const hasBye = shuffledParticipants.length % 2 !== 0;
        
        for (let i = 0; i < shuffledParticipants.length - (hasBye ? 1 : 0); i += 2) {
            const match = {
                id: matchNumber,
                round,
                participant1: shuffledParticipants[i],
                participant2: shuffledParticipants[i + 1],
                score1: null,
                score2: null,
                winner: null,
                venue: tournamentData.venues[(matchNumber - 1) % tournamentData.numVenues],
                status: 'scheduled'
            };
            
            roundMatches.push(match);
            tournamentData.matches.push(match);
            matchNumber++;
        }
        
        if (hasBye) {
            const byeParticipant = shuffledParticipants[shuffledParticipants.length - 1];
            roundMatches.push({
                id: matchNumber,
                round,
                participant1: byeParticipant,
                participant2: 'BYE',
                score1: 1,
                score2: 0,
                winner: byeParticipant,
                venue: 'BYE',
                status: 'completed',
                isBye: true
            });
            tournamentData.matches.push(roundMatches[roundMatches.length - 1]);
            matchNumber++;
        }
        
        tournamentData.brackets.push(roundMatches);
    }
    
    initializeStandings();
}

// Inicializar clasificación
function initializeStandings() {
    tournamentData.standings = new Map();
    
    tournamentData.participants.forEach(participant => {
        if (participant !== 'BYE') {
            tournamentData.standings.set(participant, {
                points: 0,
                played: 0,
                wins: 0,
                losses: 0,
                draws: 0,
                goalsFor: 0,
                goalsAgainst: 0,
                goalDifference: 0
            });
        }
    });
}

// Renderizar resumen
function renderSummary() {
    const container = document.getElementById('summaryContainer');
    container.innerHTML = `
        <div class="summary-grid">
            <div class="summary-card">
                <h4>Participantes</h4>
                <p class="summary-value">${tournamentData.participants.length}</p>
            </div>
            <div class="summary-card">
                <h4>Grupos</h4>
                <p class="summary-value">${tournamentData.numGroups}</p>
            </div>
            <div class="summary-card">
                <h4>Canchas</h4>
                <p class="summary-value">${tournamentData.numVenues}</p>
            </div>
            <div class="summary-card">
                <h4>Partidos</h4>
                <p class="summary-value">${tournamentData.matches.length}</p>
            </div>
        </div>
    `;
}

// Renderizar grupos
function renderGroups() {
    const container = document.getElementById('groupsContainer');
    container.innerHTML = '<div class="groups-grid">';
    
    tournamentData.groups.forEach((group, index) => {
        container.innerHTML += `
            <div class="group-card">
                <div class="group-title group-banner-${index}">
                    ${group.name}
                </div>
                <div class="group-teams">
                    ${group.participants.map(team => 
                        `<div class="group-team">
                            <span>${team}</span>
                        </div>`
                    ).join('')}
                </div>
            </div>
        `;
    });
    
    container.innerHTML += '</div>';
}

// Renderizar bracket
function renderBracket() {
    const container = document.getElementById('bracketContainer');
    container.innerHTML = '';
    
    tournamentData.brackets.forEach((round, roundIndex) => {
        const roundDiv = document.createElement('div');
        roundDiv.className = 'bracket-round';
        roundDiv.innerHTML = `
            <div class="round-header">
                <h3>Ronda ${roundIndex + 1}</h3>
            </div>
        `;
        
        round.forEach(match => {
            const matchCard = document.createElement('div');
            matchCard.className = 'match-card';
            matchCard.innerHTML = `
                <span class="match-venue">🏟️ ${match.venue}</span>
                <div class="match-teams">
                    <div class="team-row">
                        <span class="team-name">${match.participant1}</span>
                        <input type="number" class="team-score" 
                               placeholder="0" 
                               value="${match.score1 ?? ''}"
                               onchange="updateScore(${match.id}, 1, this.value)">
                    </div>
                    <div class="team-row">
                        <span class="team-name">${match.participant2}</span>
                        <input type="number" class="team-score" 
                               placeholder="0" 
                               value="${match.score2 ?? ''}"
                               onchange="updateScore(${match.id}, 2, this.value)">
                    </div>
                    ${match.winner ? `<span class="winner-badge">✅ Ganador: ${match.winner}</span>` : ''}
                </div>
            `;
            
            roundDiv.appendChild(matchCard);
        });
        
        container.appendChild(roundDiv);
    });
}

// Renderizar partidos
function renderMatches() {
    const container = document.getElementById('matchesContainer');
    container.innerHTML = '';
    
    // Agrupar por cancha
    tournamentData.venues.forEach(venue => {
        const venueMatches = tournamentData.matches.filter(m => m.venue === venue);
        if (venueMatches.length > 0) {
            container.innerHTML += `
                <div class="venue-section">
                    <h3 class="venue-title">🏟️ ${venue}</h3>
                    <div class="venue-matches">
                        ${venueMatches.map(match => `
                            <div class="match-item">
                                <span class="match-round">R${match.round}</span>
                                <span>${match.participant1} vs ${match.participant2}</span>
                                <span class="match-status">${match.winner ? '✅' : '⏳'}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    });
}

// Actualizar marcador
function updateScore(matchId, teamNumber, score) {
    const match = tournamentData.matches.find(m => m.id === matchId);
    
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
            match.winner = 'Empate';
        }
        match.status = 'completed';
        
        updateStandings(match);
        propagateWinner(match);
    }
    
    renderBracket();
    renderMatches();
    renderStandings();
}

// Propagar ganador
function propagateWinner(match) {
    if (!match.winner || match.winner === 'Empate') return;
    
    const nextRound = match.round + 1;
    const nextRoundIndex = tournamentData.brackets.findIndex((_, idx) => idx === nextRound - 1);
    
    if (nextRoundIndex !== -1) {
        const nextMatches = tournamentData.brackets[nextRoundIndex];
        const matchIndexInRound = tournamentData.brackets[match.round - 1].indexOf(match);
        const nextMatchIndex = Math.floor(matchIndexInRound / 2);
        
        if (nextMatches[nextMatchIndex]) {
            const isFirstInPair = matchIndexInRound % 2 === 0;
            
            if (isFirstInPair) {
                nextMatches[nextMatchIndex].participant1 = match.winner;
            } else {
                nextMatches[nextMatchIndex].participant2 = match.winner;
            }
        }
    }
}

// Actualizar clasificación
function updateStandings(match) {
    if (!match.winner) return;
    
    const updateStats = (participant, result, gf, ga) => {
        if (participant === 'BYE' || !participant) return;
        
        const stats = tournamentData.standings.get(participant) || {
            points: 0, played: 0, wins: 0, losses: 0, draws: 0,
            goalsFor: 0, goalsAgainst: 0, goalDifference: 0
        };
        
        stats.played++;
        stats.goalsFor += gf;
        stats.goalsAgainst += ga;
        stats.goalDifference = stats.goalsFor - stats.goalsAgainst;
        
        switch (result) {
            case 'win':
                stats.wins++;
                stats.points += 3;
                break;
            case 'loss':
                stats.losses++;
                break;
            case 'draw':
                stats.draws++;
                stats.points += 1;
                break;
        }
        
        tournamentData.standings.set(participant, stats);
    };
    
    if (match.winner === match.participant1) {
        updateStats(match.participant1, 'win', match.score1, match.score2);
        updateStats(match.participant2, 'loss', match.score2, match.score1);
    } else if (match.winner === match.participant2) {
        updateStats(match.participant2, 'win', match.score2, match.score1);
        updateStats(match.participant1, 'loss', match.score1, match.score2);
    } else if (match.winner === 'Empate') {
        updateStats(match.participant1, 'draw', match.score1, match.score2);
        updateStats(match.participant2, 'draw', match.score2, match.score1);
    }
}

// Renderizar clasificación
function renderStandings() {
    const container = document.getElementById('standingsContainer');
    container.innerHTML = '';
    
    if (tournamentData.standings.size === 0) return;
    
    const standingsArray = Array.from(tournamentData.standings.entries())
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
            return b.goalsFor - a.goalsFor;
        });
    
    let tableHTML = `
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
    `;
    
    standingsArray.forEach((team, index) => {
        const positionClass = index < 3 ? `position-${index + 1}` : '';
        tableHTML += `
            <tr class="${positionClass}">
                <td><strong>${index + 1}</strong></td>
                <td><strong>${team.name}</strong></td>
                <td>${team.played}</td>
                <td>${team.wins}</td>
                <td>${team.draws}</td>
                <td>${team.losses}</td>
                <td>${team.goalsFor}</td>
                <td>${team.goalsAgainst}</td>
                <td>${team.goalDifference > 0 ? '+' : ''}${team.goalDifference}</td>
                <td><strong>${team.points}</strong></td>
            </tr>
        `;
    });
    
    tableHTML += '</tbody></table>';
    container.innerHTML = tableHTML;
}

// Exportar PDF
function exportPDF(section) {
    let element = null;
    let filename = '';
    
    switch(section) {
        case 'bracket':
            element = document.getElementById('bracketContainer');
            filename = 'llaves-torneo.pdf';
            break;
        case 'matches':
            element = document.getElementById('matchesContainer');
            filename = 'partidos-torneo.pdf';
            break;
        case 'standings':
            element = document.getElementById('standingsContainer');
            filename = 'clasificacion-torneo.pdf';
            break;
    }
    
    if (element) {
        html2pdf().from(element).save(filename);
    }
}

// Guardar estado
function saveTournament() {
    const dataToSave = {
        ...tournamentData,
        standings: Array.from(tournamentData.standings.entries())
    };
    localStorage.setItem('tournamentData', JSON.stringify(dataToSave));
    alert('✅ Torneo guardado correctamente');
}

// Cargar estado
function loadTournament() {
    const saved = localStorage.getItem('tournamentData');
    if (saved) {
        const data = JSON.parse(saved);
        tournamentData = {
            ...data,
            standings: new Map(data.standings)
        };
        renderSummary();
        renderGroups();
        renderBracket();
        renderMatches();
        renderStandings();
        
        document.getElementById('summarySection').classList.remove('hidden');
        document.getElementById('groupsSection').classList.remove('hidden');
        document.getElementById('bracketSection').classList.remove('hidden');
        document.getElementById('matchesSection').classList.remove('hidden');
        document.getElementById('standingsSection').classList.remove('hidden');
    }
}

// Cargar ejemplo
function loadExample() {
    document.getElementById('participantsList').value = 
        'Real Madrid\nBarcelona\nAtlético Madrid\nSevilla\n' +
        'Valencia\nVillarreal\nBetis\nReal Sociedad\n' +
        'Athletic Club\nGetafe\nOsasuna\nCelta Vigo\n' +
        'Espanyol\nMallorca\nRayo Vallecano\nCádiz';
    document.getElementById('numGroups').value = 4;
    document.getElementById('numVenues').value = 3;
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    loadExample();
    
    if (localStorage.getItem('tournamentData')) {
        loadTournament();
    }
});
