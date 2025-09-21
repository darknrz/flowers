// Letra de la canción con tiempos sincronizados
const lyrics = [
    {
        "start": 3.0,
        "end": 7.46,
        "text": "Él la estaba esperando con una flor amarilla"
    },
    {
        "start": 10.62,
        "end": 15.74,
        "text": "Ella lo estaba soñando con la luz en su pupila"
    },
    {
        "start": 18.42,
        "end": 23.62,
        "text": "Y el amarillo del sol iluminaba la esquina"
    },
    {
        "start": 26.52,
        "end": 31.06,
        "text": "Lo sentía tan cercano, lo sentía desde niña"
    },
    {
        "start": 32.8,
        "end": 37.24,
        "text": "Ella sabía, él sabía que algún día pasaría"
    },
    {
        "start": 37.42,
        "end": 42.86,
        "text": "Que vendría a buscarla con sus flores amarillas"
    },
    {
        "start": 45.18,
        "end": 49.24,
        "text": "No te apures, no te detengas el instante del encuentro"
    },
    {
        "start": 49.3,
        "end": 52.98,
        "text": "Está dicho que es un hecho, no la pierdas, no hay derecho"
    },
    {
        "start": 53.0,
        "end": 60.52,
        "text": "No te olvides que la vida casi nunca está dormida"
    },
    {
        "start": 64.06,
        "end": 68.7,
        "text": "En ese bar tan desierto, no se esperaba el encuentro"
    },
    {
        "start": 71.96,
        "end": 76.34,
        "text": "Ella sabía, él sabía que algún día pasaría"
    },
    {
        "start": 76.46,
        "end": 81.88,
        "text": "Que vendría a buscarla con sus flores amarillas"
    },
    {
        "start": 84.34,
        "end": 88.32,
        "text": "No te apures, no te inkas el instante del encuentro"
    },
    {
        "start": 88.36,
        "end": 92.1,
        "text": "Está dicho que es un hecho, no la pierdas, no hay derecho"
    },
    {
        "start": 92.22,
        "end": 99.86,
        "text": "No te olvides que la vida casi nunca está dormida"
    },
    {
        "start": 108.96,
        "end": 111.7,
        "text": "Flores amarillas"
    }
];

// Elementos del DOM
const audio = document.getElementById('musica1');
const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const volumeBtn = document.getElementById('volumeBtn');
const volumeIcon = document.getElementById('volumeIcon');
const muteIcon = document.getElementById('muteIcon');
const progressBar = document.getElementById('progress');
const progressContainer = document.querySelector('.progress-container');
const currentTimeSpan = document.getElementById('currentTime');
const durationSpan = document.getElementById('duration');
const volumeSlider = document.getElementById('volumeSlider');
const lyricsText = document.getElementById('lyricsText');

// Variables de control
let isPlaying = false;
let isMuted = false;
let currentLyricIndex = -1;

// Inicializar el reproductor
function initializePlayer() {
    // Configurar volumen inicial
    audio.volume = volumeSlider.value / 100;
    
    // Event listeners
    playPauseBtn.addEventListener('click', togglePlayPause);
    volumeBtn.addEventListener('click', toggleMute);
    progressContainer.addEventListener('click', setProgress);
    volumeSlider.addEventListener('input', setVolume);
    
    // Event listeners del audio
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', onAudioEnded);
    audio.addEventListener('canplaythrough', () => {
        console.log('Audio cargado y listo para reproducir');
    });
    
    // Manejar errores de carga
    audio.addEventListener('error', (e) => {
        console.error('Error cargando el audio:', e);
        alert('Error al cargar el archivo de audio. Verifica que el archivo existe.');
    });
}

// Función para reproducir/pausar
function togglePlayPause() {
    if (isPlaying) {
        pauseAudio();
    } else {
        playAudio();
    }
}

// Reproducir audio
function playAudio() {
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            isPlaying = true;
            updatePlayPauseButton();
            console.log('Audio reproduciendo');
        }).catch((error) => {
            console.error('Error al reproducir:', error);
            if (error.name === 'NotAllowedError') {
                alert('Por favor, haz clic en el botón de play para iniciar la música');
            }
        });
    }
}

// Pausar audio
function pauseAudio() {
    audio.pause();
    isPlaying = false;
    updatePlayPauseButton();
    hideLyrics();
}

// Actualizar botón de play/pausa
function updatePlayPauseButton() {
    if (isPlaying) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
    } else {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    }
}

// Alternar mute
function toggleMute() {
    isMuted = !isMuted;
    audio.muted = isMuted;
    updateVolumeButton();
    
    // Si desmutea, restaurar el volumen del slider
    if (!isMuted) {
        audio.volume = volumeSlider.value / 100;
    }
}

// Actualizar botón de volumen
function updateVolumeButton() {
    if (isMuted || audio.volume === 0) {
        volumeIcon.style.display = 'none';
        muteIcon.style.display = 'block';
    } else {
        volumeIcon.style.display = 'block';
        muteIcon.style.display = 'none';
    }
}

// Cuando el audio termine
function onAudioEnded() {
    isPlaying = false;
    updatePlayPauseButton();
    progressBar.style.width = '0%';
    hideLyrics();
    currentLyricIndex = -1;
}

// Actualizar duración total
function updateDuration() {
    if (audio.duration) {
        durationSpan.textContent = formatTime(audio.duration);
    }
}

// Actualizar progreso y letra
function updateProgress() {
    if (audio.duration) {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = progress + '%';
        currentTimeSpan.textContent = formatTime(audio.currentTime);
        
        // Actualizar letra
        updateLyrics(audio.currentTime);
    }
}

// Establecer progreso cuando se hace clic en la barra
function setProgress(e) {
    if (audio.duration) {
        const rect = progressContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const progress = clickX / width;
        audio.currentTime = progress * audio.duration;
    }
}

// Controlar volumen
function setVolume() {
    const volume = volumeSlider.value / 100;
    audio.volume = volume;
    
    // Actualizar estado de mute basado en el volumen
    if (volume === 0) {
        isMuted = true;
        audio.muted = true;
    } else if (isMuted) {
        isMuted = false;
        audio.muted = false;
    }
    
    updateVolumeButton();
}

// Formatear tiempo en mm:ss
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Actualizar letra sincronizada
function updateLyrics(currentTime) {
    // Encontrar la letra actual
    let activeIndex = -1;
    
    for (let i = 0; i < lyrics.length; i++) {
        if (currentTime >= lyrics[i].start && currentTime <= lyrics[i].end) {
            activeIndex = i;
            break;
        }
    }
    
    // Si hay un cambio en la letra
    if (activeIndex !== currentLyricIndex) {
        currentLyricIndex = activeIndex;
        
        if (activeIndex >= 0) {
            showLyrics(lyrics[activeIndex].text);
        } else {
            hideLyrics();
        }
    }
}

// Mostrar letra
function showLyrics(text) {
    lyricsText.textContent = `"${text}"`;
    lyricsText.classList.add('active');
}

// Ocultar letra
function hideLyrics() {
    lyricsText.classList.remove('active');
    setTimeout(() => {
        if (!lyricsText.classList.contains('active')) {
            lyricsText.textContent = '';
        }
    }, 400); // Esperar a que termine la transición
}

// Función legacy para compatibilidad (si necesitas mantener el onclick del body)
function PlayAudio() {
    if (!isPlaying) {
        playAudio();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initializePlayer);

// También inicializar si el script se carga después del DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePlayer);
} else {
    initializePlayer();
}