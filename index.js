const apiKey = Bun.env.LASTFM_API_KEY;
const username = Bun.env.LASTFM_USERNAME;
const hikkaSecret = Bun.env.HIKKA_SECRET;
const fallbackDescription = Bun.env.FALLBACK_DESCRIPTION;
const updateInterval = Bun.env.UPDATE_INTERVAL;

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

        console.log('User description updated successfully with:', description);
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

        if (latestTrack['@attr']?.nowplaying) {
            const generalLink = `[${latestTrack.artist['#text']} - ${latestTrack.name}](https://www.last.fm/music/${latestTrack.artist['#text'].includes(' ') ? encodeURI(latestTrack.artist['#text']) : latestTrack.artist['#text']})`;
            // const artistLink = `[${latestTrack.artist['#text']}](https://www.last.fm/music/${latestTrack.artist['#text']})`;
            // const songLink = `[${latestTrack.name}](https://www.last.fm/music/${latestTrack.artist['#text']}/_/` + `${latestTrack.name})`;
            // return 🎵 Зараз слухає: ${latestTrack.artist['#text']} - ${latestTrack.name} 🎶;
            return `🎵 **Зараз слухає:** ${generalLink} 🎶`;
        }
    } catch (err) {
        console.error('Error fetching the latest scrobble: ', err);
    }
}

const main = async () => {
    const userDescription = await getCurrentUserDescription();
    const latestScrobble = await getLatestScrobble();

    if (!latestScrobble && userDescription == fallbackDescription) return;

    if (latestScrobble) {
        if (userDescription == latestScrobble) return;
        return setCurrentUserDescription(latestScrobble);
    }

    if (!latestScrobble && userDescription != fallbackDescription) return setCurrentUserDescription(fallbackDescription);
}

main();
setInterval(main, 1000 * updateInterval);