// Estado global
let tournamentData = {
    sport: 'football',
    format: 'auto',
    numParticipants: 8,
    numGroups: 2,
    numVenues: 2,
    matchDuration: 30,
    participants: [],
    groups: [],
    groupMatches: [],
    knockoutBrackets: [],
    groupStandings: new Map(),
    venues: []
};

// Información de deportes
const sportInfo = {
    football: { type: 'team', name: 'Fútbol', icon: '⚽', recommendedFormat: 'groups_knockout' },
    basketball: { type: 'team', name: 'Baloncesto', icon: '🏀', recommendedFormat: 'groups_knockout' },
    volleyball: { type: 'team', name: 'Voleibol', icon: '🏐', recommendedFormat: 'groups_knockout' },
    handball: { type: 'team', name: 'Balonmano', icon: '🤾', recommendedFormat: 'groups_knockout' },
    tennis: { type: 'individual', name: 'Tenis', icon: '🎾', recommendedFormat: 'single_elimination' },
    chess: { type: 'individual', name: 'Ajedrez', icon: '♟️', recommendedFormat: 'swiss' },
    padel: { type: 'individual', name: 'Pádel', icon: '🏸', recommendedFormat: 'single_elimination' },
    table_tennis: { type: 'individual', name: 'Tenis de Mesa', icon: '🏓', recommendedFormat: 'single_elimination' }
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    loadExample();
    updateTeamCount();
    onSportChange();
    console.log('Sistema inicializado correctamente');
});

// Mostrar notificaciones
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');
    
    setTimeout(function() {
        notification.classList.add('hidden');
    }, 3000);
}

// Cambio de deporte
function onSportChange() {
    const sport = document.getElementById('sportSelect').value;
    const info = sportInfo[sport];
    
    if (info) {
        document.getElementById('headerTitle').textContent = `${info.icon} Gestor de Torneos Profesional`;
        
        const formatSelect = document.getElementById('formatSelect');
        formatSelect.value = 'auto';
        
        const recommendationDiv = document.getElementById('recommendationInfo');
        if (info.type === 'individual') {
            recommendationDiv.innerHTML = `<strong>${info.name} (Individual)</strong> - Recomendado: Eliminación Directa o Suizo`;
        } else {
            recommendationDiv.innerHTML = `<strong>${info.name} (Colectivo)</strong> - Recomendado: Grupos + Eliminatorias`;
        }
    }
}

// Cambio de formato
function onFormatChange() {
    updateRecommendations();
}

// Actualizar recomendaciones
function updateRecommendations() {
    const numParticipants = parseInt(document.getElementById('numParticipants').value) || 8;
    const numGroups = parseInt(document.getElementById('numGroups').value) || 2;
    
    const recommendationDiv = document.getElementById('recommendationInfo');
    
    if (numGroups > 1 && numParticipants % numGroups !== 0) {
        recommendationDiv.className = 'info-box warning';
        recommendationDiv.innerHTML = `⚠️ ${numParticipants} participantes en ${numGroups} grupos no es divisible exactamente`;
    } else if (numGroups === 1) {
        recommendationDiv.className = 'info-box';
        recommendationDiv.innerHTML = 'ℹ️ Un solo grupo: se usará Round-Robin';
    } else {
        recommendationDiv.className = 'info-box';
        recommendationDiv.innerHTML = `✅ ${numParticipants} participantes en ${numGroups} grupos de ${numParticipants / numGroups}`;
    }
}

// Actualizar contador de equipos
function updateTeamCount() {
    const participants = document.getElementById('participantsList').value
        .split('\n')
        .map(function(name) { return name.trim(); })
        .filter(function(name) { return name !== ''; });
    
    const countDiv = document.getElementById('teamCount');
    countDiv.innerHTML = `Equipos ingresados: <strong>${participants.length}</strong>`;
    
    document.getElementById('numParticipants').value = participants.length || 8;
}

// Generar torneo
function generateTournament() {
    console.log('Generando torneo...');
    
    // Obtener configuración
    tournamentData.sport = document.getElementById('sportSelect').value;
    tournamentData.format = document.getElementById('formatSelect').value;
    tournamentData.numParticipants = parseInt(document.getElementById('numParticipants').value);
    tournamentData.numGroups = parseInt(document.getElementById('numGroups').value);
    tournamentData.numVenues = parseInt(document.getElementById('numVenues').value);
    tournamentData.matchDuration = parseInt(document.getElementById('matchDuration').value);
    
    // Obtener participantes
    const participantsText = document.getElementById('participantsList').value;
    tournamentData.participants = participantsText
        .split('\n')
        .map(function(name) { return name.trim(); })
        .filter(function(name) { return name !== ''; });
    
    // Validar
    if (tournamentData.participants.length < 2) {
        showNotification('Error: Se necesitan al menos 2 participantes', 'error');
        return;
    }
    
    // Crear canchas
    tournamentData.venues = [];
    for (let i = 1; i <= tournamentData.numVenues; i++) {
        tournamentData.venues.push('Cancha ' + i);
    }
    
    // Determinar formato automático
    if (tournamentData.format === 'auto') {
        const info = sportInfo[tournamentData.sport];
        tournamentData.format = info ? info.recommendedFormat : 'groups_knockout';
    }
    
    // Generar según formato
    if (tournamentData.format === 'single_elimination') {
        generateSingleElimination();
    } else if (tournamentData.format === 'round_robin') {
        generateRoundRobin();
    } else if (tournamentData.format === 'swiss') {
        generateSwiss();
    } else {
        // groups_knockout (por defecto)
        generateGroupsKnockout();
    }
    
    // Mostrar secciones
    document.getElementById('dashboardSection').classList.remove('hidden');
    document.getElementById('groupsSection').classList.remove('hidden');
    document.getElementById('knockoutSection').classList.remove('hidden');
    
    // Renderizar
    updateDashboard();
    renderGroups();
    renderFixture();
    renderStandings();
    renderQualified();
    renderBracket();
    
    showNotification('✅ Torneo generado exitosamente', 'success');
}

// Generar grupos + eliminatorias
function generateGroupsKnockout() {
    distributeToGroups();
    generateGroupMatches();
    generateKnockoutBrackets();
}

// Generar eliminación directa
function generateSingleElimination() {
    tournamentData.groups = [{
        id: 0,
        name: 'Todos',
        participants: [...tournamentData.participants]
    }];
    
    tournamentData.groupMatches = [];
    tournamentData.groupStandings = new Map();
    generateKnockoutBrackets();
}

// Generar round-robin
function generateRoundRobin() {
    if (tournamentData.numGroups > 1) {
        distributeToGroups();
        generateGroupMatches();
        tournamentData.knockoutBrackets = [];
    } else {
        tournamentData.groups = [{
            id: 0,
            name: 'Todos',
            participants: [...tournamentData.participants]
        }];
        generateGroupMatches();
        tournamentData.knockoutBrackets = [];
    }
}

// Generar sistema suizo
function generateSwiss() {
    tournamentData.groups = [{
        id: 0,
        name: 'Todos',
        participants: [...tournamentData.participants]
    }];
    generateGroupMatches();
    tournamentData.knockoutBrackets = [];
}

// Distribuir en grupos
function distributeToGroups() {
    tournamentData.groups = [];
    const shuffled = [...tournamentData.participants].sort(function() { return Math.random() - 0.5; });
    
    for (let i = 0; i < tournamentData.numGroups; i++) {
        tournamentData.groups.push({
            id: i,
            name: 'Grupo ' + String.fromCharCode(65 + i),
            participants: []
        });
    }
    
    shuffled.forEach(function(participant, index) {
        const groupIndex = index % tournamentData.numGroups;
        tournamentData.groups[groupIndex].participants.push(participant);
    });
}

// Generar partidos de grupos
function generateGroupMatches() {
    tournamentData.groupMatches = [];
    tournamentData.groupStandings = new Map();
    
    let matchId = 1;
    
    tournamentData.groups.forEach(function(group) {
        const participants = group.participants;
        const standings = new Map();
        
        participants.forEach(function(p) {
            standings.set(p, {
                points: 0,
                played: 0,
                wins: 0,
                draws: 0,
                losses: 0,
                goalsFor: 0,
                goalsAgainst: 0,
                goalDifference: 0
            });
        });
        
        tournamentData.groupStandings.set(group.id, standings);
        
        // Generar todos contra todos
        for (let i = 0; i < participants.length; i++) {
            for (let j = i + 1; j < participants.length; j++) {
                const match = {
                    id: matchId,
                    groupId: group.id,
                    groupName: group.name,
                    participant1: participants[i],
                    participant2: participants[j],
                    score1: null,
                    score2: null,
                    winner: null,
                    venue: tournamentData.venues[(matchId - 1) % tournamentData.numVenues],
                    status: 'scheduled'
                };
                tournamentData.groupMatches.push(match);
                matchId++;
            }
        }
    });
}

// Generar brackets de eliminatoria
function generateKnockoutBrackets() {
    tournamentData.knockoutBrackets = [];
    
    const totalTeams = tournamentData.numGroups > 1 ? 
        tournamentData.numGroups * 2 : 
        Math.pow(2, Math.ceil(Math.log2(tournamentData.participants.length)));
    
    const numRounds = Math.log2(totalTeams);
    
    let matchId = tournamentData.groupMatches.length + 1;
    
    const roundNames = ['', 'Dieciseisavos', 'Octavos', 'Cuartos', 'Semifinales', 'Final'];
    
    for (let round = 1; round <= numRounds; round++) {
        const matchesInRound = totalTeams / Math.pow(2, round);
        const roundMatches = [];
        
        for (let i = 0; i < matchesInRound; i++) {
            roundMatches.push({
                id: matchId,
                round: round,
                roundName: roundNames[round] || ('Ronda ' + round),
                participant1: null,
                participant2: null,
                score1: null,
                score2: null,
                winner: null,
                venue: tournamentData.venues[(matchId - 1) % tournamentData.numVenues],
                status: 'pending'
            });
            matchId++;
        }
        
        tournamentData.knockoutBrackets.push(roundMatches);
    }
}

// Actualizar dashboard
function updateDashboard() {
    const totalMatches = tournamentData.groupMatches.length + 
        (tournamentData.knockoutBrackets.length > 0 ? tournamentData.knockoutBrackets.flat().length : 0);
    
    const playedMatches = tournamentData.groupMatches.filter(function(m) { 
        return m.status === 'completed'; 
    }).length;
    
    document.getElementById('statParticipants').textContent = tournamentData.participants.length;
    document.getElementById('statGroups').textContent = tournamentData.numGroups;
    document.getElementById('statTotalMatches').textContent = totalMatches;
    document.getElementById('statPlayed').textContent = playedMatches;
}

// Renderizar grupos
function renderGroups() {
    const container = document.getElementById('groupsContainer');
    container.innerHTML = '<div class="groups-grid">';
    
    tournamentData.groups.forEach(function(group, index) {
        container.innerHTML += `
            <div class="group-card">
                <div class="group-title group-bg-${index % 8}">${group.name}</div>
                <div class="group-teams">
                    ${group.participants.map(function(team) {
                        return `<div class="group-team">${team}</div>`;
                    }).join('')}
                </div>
            </div>
        `;
    });
    
    container.innerHTML += '</div>';
}

// Renderizar fixture
function renderFixture() {
    const container = document.getElementById('fixtureContainer');
    container.innerHTML = '<h3>📅 Partidos de Grupos</h3>';
    
    if (tournamentData.groupMatches.length === 0) {
        container.innerHTML += '<p>No hay partidos de grupos (formato de eliminación directa)</p>';
        return;
    }
    
    // Agrupar por grupo
    tournamentData.groups.forEach(function(group, groupIndex) {
        const groupMatches = tournamentData.groupMatches.filter(function(m) { 
            return m.groupId === group.id; 
        });
        
        if (groupMatches.length > 0) {
            container.innerHTML += `
                <div class="match-round">
                    <div class="match-round-title">${group.name}</div>
            `;
            
            groupMatches.forEach(function(match) {
                container.innerHTML += `
                    <div class="match-card">
                        <span class="match-group-badge group-bg-${groupIndex % 8}">${match.groupName}</span>
                        <span class="match-venue">🏟️ ${match.venue}</span>
                        <div class="team-row">
                            <span class="team-name">${match.participant1}</span>
                            <input type="number" class="team-score" placeholder="0" 
                                   value="${match.score1 ?? ''}"
                                   onchange="updateGroupScore(${match.id}, 1, this.value)">
                        </div>
                        <div class="team-row">
                            <span class="team-name">${match.participant2}</span>
                            <input type="number" class="team-score" placeholder="0" 
                                   value="${match.score2 ?? ''}"
                                   onchange="updateGroupScore(${match.id}, 2, this.value)">
                        </div>
                        ${match.winner ? `<span class="winner-badge">✅ ${match.winner}</span>` : ''}
                    </div>
                `;
            });
            
            container.innerHTML += '</div>';
        }
    });
}

// Actualizar marcador de grupo
function updateGroupScore(matchId, teamNumber, score) {
    const match = tournamentData.groupMatches.find(function(m) { return m.id === matchId; });
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
        populateKnockoutBrackets();
    }
    
    renderFixture();
    renderStandings();
    renderQualified();
    renderBracket();
}

// Actualizar clasificación
function updateGroupStandings(match) {
    const standings = tournamentData.groupStandings.get(match.groupId);
    if (!standings) return;
    
    const updateStats = function(teamName, result, gf, ga) {
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

// Renderizar tablas
function renderStandings() {
    const container = document.getElementById('standingsContainer');
    container.innerHTML = '<h3>📊 Tablas de Posiciones</h3>';
    
    if (tournamentData.groupStandings.size === 0) {
        container.innerHTML += '<p>No hay clasificación disponible</p>';
        return;
    }
    
    tournamentData.groups.forEach(function(group, groupIndex) {
        const standings = tournamentData.groupStandings.get(group.id);
        if (!standings) return;
        
        const sortedTeams = Array.from(standings.entries())
            .map(function(entry) { 
                return { name: entry[0], ...entry[1] }; 
            })
            .sort(function(a, b) {
                if (b.points !== a.points) return b.points - a.points;
                if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
                return b.goalsFor - a.goalsFor;
            });
        
        container.innerHTML += `
            <div class="group-card">
                <div class="group-title group-bg-${groupIndex % 8}">${group.name}</div>
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
                        ${sortedTeams.map(function(team, idx) {
                            return `
                                <tr class="${idx < 2 ? 'position-qualified' : ''}">
                                    <td>${idx + 1}</td>
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
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    });
}

// Poblar brackets de eliminatoria
function populateKnockoutBrackets() {
    const allCompleted = tournamentData.groupMatches.every(function(m) { 
        return m.status === 'completed'; 
    });
    
    if (!allCompleted || tournamentData.knockoutBrackets.length === 0) return;
    
    const qualified = [];
    
    tournamentData.groupStandings.forEach(function(standings, groupId) {
        const sortedTeams = Array.from(standings.entries())
            .map(function(entry) { 
                return { name: entry[0], ...entry[1] }; 
            })
            .sort(function(a, b) { return b.points - a.points; });
        
        if (sortedTeams.length >= 2) {
            qualified.push(sortedTeams[0].name, sortedTeams[1].name);
        }
    });
    
    const firstRound = tournamentData.knockoutBrackets[0];
    firstRound.forEach(function(match, index) {
        if (index * 2 < qualified.length) {
            match.participant1 = qualified[index * 2] || 'Por definir';
            match.participant2 = qualified[index * 2 + 1] || 'Por definir';
            match.status = 'scheduled';
        }
    });
}

// Renderizar clasificados
function renderQualified() {
    const container = document.getElementById('qualifiedContainer');
    container.innerHTML = '<h3>✅ Clasificados</h3><div class="qualified-grid">';
    
    tournamentData.groupStandings.forEach(function(standings, groupId) {
        const group = tournamentData.groups.find(function(g) { return g.id === groupId; });
        if (!group) return;
        
        const sortedTeams = Array.from(standings.entries())
            .map(function(entry) { 
                return { name: entry[0], ...entry[1] }; 
            })
            .sort(function(a, b) { return b.points - a.points; });
        
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

// Renderizar bracket
function renderBracket() {
    const container = document.getElementById('bracketContainer');
    container.innerHTML = '';
    
    if (tournamentData.knockoutBrackets.length === 0) {
        container.innerHTML = '<p>No hay fase eliminatoria</p>';
        return;
    }
    
    tournamentData.knockoutBrackets.forEach(function(round, index) {
        container.innerHTML += `
            <div class="match-round">
                <div class="match-round-title">${round[0]?.roundName || 'Ronda ' + (index + 1)}</div>
        `;
        
        round.forEach(function(match) {
            container.innerHTML += `
                <div class="match-card">
                    <span class="match-venue">🏟️ ${match.venue}</span>
                    <div class="team-row">
                        <span class="team-name">${match.participant1 || 'Por definir'}</span>
                        <input type="number" class="team-score" placeholder="0" 
                               value="${match.score1 ?? ''}"
                               onchange="updateKnockoutScore(${match.id}, 1, this.value)">
                    </div>
                    <div class="team-row">
                        <span class="team-name">${match.participant2 || 'Por definir'}</span>
                        <input type="number" class="team-score" placeholder="0" 
                               value="${match.score2 ?? ''}"
                               onchange="updateKnockoutScore(${match.id}, 2, this.value)">
                    </div>
                    ${match.winner ? `<span class="winner-badge">✅ ${match.winner}</span>` : ''}
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
    
    tournamentData.knockoutBrackets.forEach(function(round, rIdx) {
        round.forEach(function(m, mIdx) {
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
            
            if (nextRound[nextMatchIndex]) {
                if (matchIndex % 2 === 0) {
                    nextRound[nextMatchIndex].participant1 = match.winner;
                } else {
                    nextRound[nextMatchIndex].participant2 = match.winner;
                }
            }
        } else {
            showNotification('🏆 ¡' + match.winner + ' es el Campeón!', 'success');
        }
    }
    
    renderBracket();
}

// Exportar PDF
function exportPDF(section) {
    let element = null;
    let filename = '';
    
    if (section === 'groups') {
        element = document.getElementById('groupsSection');
        filename = 'fase-grupos.pdf';
    } else if (section === 'knockout') {
        element = document.getElementById('knockoutSection');
        filename = 'eliminatorias.pdf';
    }
    
    if (element && typeof html2pdf !== 'undefined') {
        html2pdf().from(element).save(filename);
        showNotification('PDF exportado', 'success');
    } else {
        showNotification('Error: Librería PDF no disponible', 'error');
    }
}

// Exportar reporte completo
function exportFullReport() {
    const reportHTML = `
        <div style="padding: 20px;">
            <h1>Reporte del Torneo</h1>
            <p>Fecha: ${new Date().toLocaleDateString()}</p>
            ${document.getElementById('groupsSection').innerHTML}
            ${document.getElementById('knockoutSection').innerHTML}
        </div>
    `;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = reportHTML;
    
    if (typeof html2pdf !== 'undefined') {
        html2pdf().from(tempDiv).save('reporte-completo.pdf');
        showNotification('Reporte exportado', 'success');
    }
}

// Guardar torneo
function saveTournament() {
    try {
        const dataToSave = {
            ...tournamentData,
            groupStandings: Array.from(tournamentData.groupStandings.entries())
        };
        localStorage.setItem('tournamentData', JSON.stringify(dataToSave));
        showNotification('💾 Torneo guardado', 'success');
    } catch (error) {
        showNotification('Error al guardar', 'error');
    }
}

// Cargar torneo
function loadTournament() {
    try {
        const saved = localStorage.getItem('tournamentData');
        if (saved) {
            const data = JSON.parse(saved);
            tournamentData = {
                ...data,
                groupStandings: new Map(data.groupStandings)
            };
            
            document.getElementById('dashboardSection').classList.remove('hidden');
            document.getElementById('groupsSection').classList.remove('hidden');
            document.getElementById('knockoutSection').classList.remove('hidden');
            
            updateDashboard();
            renderGroups();
            renderFixture();
            renderStandings();
            renderQualified();
            renderBracket();
            
            showNotification('📂 Torneo cargado', 'success');
        } else {
            showNotification('No hay torneo guardado', 'error');
        }
    } catch (error) {
        showNotification('Error al cargar', 'error');
    }
}

// Cargar ejemplo
function loadExample() {
    const exampleTeams = [
        'Argentina', 'Brasil', 'Francia', 'Alemania',
        'España', 'Inglaterra', 'Portugal', 'Holanda'
    ];
    
    document.getElementById('participantsList').value = exampleTeams.join('\n');
    document.getElementById('numParticipants').value = 8;
    document.getElementById('numGroups').value = 2;
    document.getElementById('numVenues').value = 2;
    document.getElementById('matchDuration').value = 30;
    
    updateTeamCount();
    updateRecommendations();
    console.log('Ejemplo cargado: 8 equipos, 2 grupos');
}
