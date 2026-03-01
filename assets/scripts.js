// JavaScript Document
jQuery(function ($) {

    // Extract video identifier from iframe URL
    function getVideoIdentifier(iframeUrl) {
        const url = new URL(iframeUrl);
        const hostname = url.hostname;
        const pathname = url.pathname;
        
        // For YouTube videos (youtube.com, youtube-nocookie.com, youtu.be)
        if (hostname.includes('youtube') || hostname.includes('youtu.be')) {
            // Extract video ID from pathname (/embed/VIDEO_ID or /v/VIDEO_ID)
            const match = pathname.match(/\/(?:embed|v)\/([a-zA-Z0-9_-]+)/);
            if (match) {
                return `youtube.com/${match[1]}`;
            }
        }
        
        // For Vimeo videos
        if (hostname.includes('vimeo')) {
            const match = pathname.match(/\/(\d+)/);
            if (match) {
                return `vimeo.com/${match[1]}`;
            }
        }
        
        // Fallback to hostname + pathname for other providers
        return hostname + pathname;
    }

    function loadVideo(url) {
        return $.ajax({
            url: `/wp-admin/admin-ajax.php?action=video_module_load&video=${url}`,
            method: 'GET',
            dataType: 'json',
            success: (res) => {
                return res.seconds
            }
        });
    }

    function saveVideo(url, seconds) {
        $.ajax({
            url: '/wp-admin/admin-ajax.php?action=video_module_save',
            method: 'POST',
            data: {
                video: url,
                currentTime: seconds
            },
            dataType: 'json',
            success: function (res) {
                console.log(res)

            }
        })
    }

    $("iframe").each(function () {
        $(this).wrap('<div class="plyr-video-wrapper"></div>');

        const plyr = new Plyr($(this).parent());
        plyr.first_time = true

        plyr.on('ready', (event) => {
            const iframe_url = $(event.detail.plyr.elements.container).find('iframe').attr('src');
            const videoUrl = getVideoIdentifier(iframe_url);
            event.detail.plyr.video_url = videoUrl
        });

        plyr.on('play', (event) => {
            if (plyr.first_time) {
                loadVideo(event.detail.plyr.video_url).then((res) => {
                    event.detail.plyr.currentTime = parseFloat(res.seconds)
                });
            }
            plyr.first_time = false
        });

        plyr.on('pause', (event) => {
            if (plyr.first_time === false)
                saveVideo(event.detail.plyr.video_url, event.detail.plyr.currentTime)
        })

        plyr.on('progress', (event) => {
            if (plyr.first_time === false)
                saveVideo(event.detail.plyr.video_url, event.detail.plyr.currentTime)
        })

    });
});