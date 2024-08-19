const apiKey = Bun.env.LASTFM_API_KEY;
const username = Bun.env.LASTFM_USERNAME;
const hikkaSecret = Bun.env.HIKKA_SECRET;
const fallbackDescription = Bun.env.FALLBACK_DESCRIPTION;

const getCurrentUserDescription = async () => {
    const url = 'https://api.hikka.io/user/me';

    try {
        const res = await fetch(url, {
            headers: {
                'auth': hikkaSecret,
                'accept': 'application/json'
            }});
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        
        return data.description;
    } catch (err) {
        console.error('Error fetching the user description: ', err);
    }
}

const setCurrentUserDescription = async (description) => {
    const url = 'https://api.hikka.io/settings/description';

    try {
        const res = await fetch(url, {
            method: 'PUT',
            headers: {
                'auth': hikkaSecret,
                'accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ description })
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
    } catch (err) {
        console.error('Error updating the user description: ', err);
    }
}
    
const getLatestScrobble = async () => {
    const url = `http://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&user=${username}&api_key=${apiKey}&format=json&limit=1`;

    try {
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();

        const recentTracks = data.recenttracks.track;
        const latestTrack = Array.isArray(recentTracks) ? recentTracks[0] : recentTracks;

        if (latestTrack['@attr']?.nowplaying) return `🎵 Зараз слухає: ${latestTrack.artist['#text']} - ${latestTrack.name} 🎶`;
    } catch (err) {
        console.error('Error fetching the latest scrobble: ', err);
    }
}

const main = async () => {
    const userDescription = await getCurrentUserDescription();
    const latestScrobble = await getLatestScrobble();

    if (!latestScrobble && userDescription == fallbackDescription) return;

    if (latestScrobble) return setCurrentUserDescription(latestScrobble);

    if (!latestScrobble && userDescription != fallbackDescription) return setCurrentUserDescription(fallbackDescription);
}

main();
setInterval(main, 1000 * 30);