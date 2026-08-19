// Estado global
let tournamentData = {
    sport: '',
    format: '',
    participants: [],
    matches: [],
    standings: new Map(),
    brackets: []
};

// Generar torneo
function generateTournament() {
    // Obtener datos del formulario
    tournamentData.sport = document.getElementById('sportSelect').value;
    tournamentData.format = document.getElementById('formatSelect').value;
    
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
    document.getElementById('bracketSection').classList.remove('hidden');
    document.getElementById('standingsSection').classList.remove('hidden');
    
    // Renderizar
    renderBracket();
    renderStandings();
}

// Eliminación Simple
function generateSingleElimination() {
    const numParticipants = tournamentData.participants.length;
    const numRounds = Math.ceil(Math.log2(numParticipants));
    const totalSlots = Math.pow(2, numRounds);
    
    tournamentData.brackets = [];
    tournamentData.matches = [];
    
    // Primera ronda
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
            winner: null
        };
        
        firstRound.push(match);
        tournamentData.matches.push(match);
        matchNumber++;
    }
    
    tournamentData.brackets.push(firstRound);
    
    // Rondas siguientes
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
                winner: null
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
    // Similar a eliminación simple pero con bracket de perdedores
    generateSingleElimination();
    
    // Añadir bracket de perdedores
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
            bracket: 'losers'
        });
    }
    
    tournamentData.brackets.push(losersBracket);
}

// Round Robin (Todos contra todos)
function generateRoundRobin() {
    const participants = [...tournamentData.participants];
    let numParticipants = participants.length;
    
    // Si es impar, agregar BYE
    if (numParticipants % 2 !== 0) {
        participants.push('BYE');
        numParticipants++;
    }
    
    const numRounds = numParticipants - 1;
    const matchesPerRound = numParticipants / 2;
    
    tournamentData.brackets = [];
    tournamentData.matches = [];
    
    let matchNumber = 1;
    
    for (let round = 0; round < numRounds; round++) {
        const roundMatches = [];
        
        for (let match = 0; match < matchesPerRound; match++) {
            const home = participants[match];
            const away = participants[numParticipants - 1 - match];
            
            const matchObj = {
                id: matchNumber,
                round: round + 1,
                participant1: home,
                participant2: away,
                score1: null,
                score2: null,
                winner: null,
                isBye: home === 'BYE' || away === 'BYE'
            };
            
            roundMatches.push(matchObj);
            tournamentData.matches.push(matchObj);
            matchNumber++;
        }
        
        tournamentData.brackets.push(roundMatches);
        
        // Rotar participantes (método del círculo)
        const last = participants.pop();
        participants.splice(1, 0, last);
    }
    
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
        
        // Ordenar por puntuación (en primera ronda es aleatorio)
        if (round > 1) {
            shuffledParticipants.sort((a, b) => {
                const scoreA = tournamentData.standings.get(a)?.points || 0;
                const scoreB = tournamentData.standings.get(b)?.points || 0;
                return scoreB - scoreA;
            });
        }
        
        // Manejar BYE si hay número impar
        const hasBye = shuffledParticipants.length % 2 !== 0;
        
        for (let i = 0; i < shuffledParticipants.length - (hasBye ? 1 : 0); i += 2) {
            const match = {
                id: matchNumber,
                round,
                participant1: shuffledParticipants[i],
                participant2: shuffledParticipants[i + 1],
                score1: null,
                score2: null,
                winner: null
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
                score1: 1,  // Victoria automática
                score2: 0,
                winner: byeParticipant,
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
                goalsAgainst: 0
            });
        }
    });
}

// Renderizar bracket
function renderBracket() {
    const container = document.getElementById('bracketContainer');
    container.innerHTML = '';
    
    tournamentData.brackets.forEach((round, roundIndex) => {
        const roundDiv = document.createElement('div');
        roundDiv.className = 'bracket-round';
        roundDiv.innerHTML = `<h3>Ronda ${roundIndex + 1}</h3>`;
        
        round.forEach(match => {
            const matchCard = document.createElement('div');
            matchCard.className = 'match-card';
            matchCard.innerHTML = `
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
                    ${match.winner ? `<span class="winner-badge">Ganador: ${match.winner}</span>` : ''}
                </div>
            `;
            
            roundDiv.appendChild(matchCard);
        });
        
        container.appendChild(roundDiv);
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
    
    // Determinar ganador
    if (match.score1 !== null && match.score2 !== null) {
        if (match.score1 > match.score2) {
            match.winner = match.participant1;
        } else if (match.score2 > match.score1) {
            match.winner = match.participant2;
        } else {
            match.winner = 'Empate';
        }
        
        // Actualizar clasificación
        updateStandings(match);
        
        // Propagar ganador a siguiente ronda
        propagateWinner(match);
    }
    
    // Re-renderizar
    renderBracket();
    renderStandings();
}

// Propagar ganador a siguiente ronda
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
    if (!match.winner || match.winner === 'Empate') return;
    
    const updateStats = (participant, result, gf, ga) => {
        if (participant === 'BYE' || !participant) return;
        
        const stats = tournamentData.standings.get(participant) || {
            points: 0, played: 0, wins: 0, losses: 0, draws: 0, goalsFor: 0, goalsAgainst: 0
        };
        
        stats.played++;
        stats.goalsFor += gf;
        stats.goalsAgainst += ga;
        
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
    } else {
        updateStats(match.participant1, 'draw', match.score1, match.score2);
        updateStats(match.participant2, 'draw', match.score2, match.score1);
    }
}

// Renderizar clasificación
function renderStandings() {
    const container = document.getElementById('standingsContainer');
    container.innerHTML = '';
    
    if (tournamentData.standings.size === 0) return;
    
    // Convertir Map a array y ordenar
    const standingsArray = Array.from(tournamentData.standings.entries())
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            const goalDiffA = a.goalsFor - a.goalsAgainst;
            const goalDiffB = b.goalsFor - b.goalsAgainst;
            return goalDiffB - goalDiffA;
        });
    
    let tableHTML = `
        <table class="standings-table">
            <thead>
                <tr>
                    <th>Posición</th>
                    <th>Participante</th>
                    <th>PJ</th>
                    <th>PG</th>
                    <th>PE</th>
                    <th>PP</th>
                    <th>GF</th>
                    <th>GC</th>
                    <th>DG</th>
                    <th>Puntos</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    standingsArray.forEach((team, index) => {
        const goalDiff = team.goalsFor - team.goalsAgainst;
        tableHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${team.name}</td>
                <td>${team.played}</td>
                <td>${team.wins}</td>
                <td>${team.draws}</td>
                <td>${team.losses}</td>
                <td>${team.goalsFor}</td>
                <td>${team.goalsAgainst}</td>
                <td>${goalDiff > 0 ? '+' : ''}${goalDiff}</td>
                <td><strong>${team.points}</strong></td>
            </tr>
        `;
    });
    
    tableHTML += '</tbody></table>';
    container.innerHTML = tableHTML;
}

// Cargar datos de ejemplo
function loadExample() {
    document.getElementById('participantsList').value = 
        'Leones FC\nÁguilas Doradas\nTiburones Rojos\nDragones Verdes\n' +
        'Toros FC\nHalcones Azules\nCaimanes FC\nFénix Blanco';
    document.getElementById('numParticipants').value = 8;
}

// Guardar estado
function saveTournament() {
    localStorage.setItem('tournamentData', JSON.stringify({
        ...tournamentData,
        standings: Array.from(tournamentData.standings.entries())
    }));
    alert('Torneo guardado en el navegador');
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
        renderBracket();
        renderStandings();
        document.getElementById('bracketSection').classList.remove('hidden');
        document.getElementById('standingsSection').classList.remove('hidden');
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    loadExample();
    
    // Cargar torneo guardado si existe
    if (localStorage.getItem('tournamentData')) {
        loadTournament();
    }
});