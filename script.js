$(function () {
    let isDragging = false;
    let center = { x: 0, y: 0 };
    let lastAngle = 0;
    let currentRotation = 0;
    let lastTimestamp = 0;
    let velocity = 0;
    let spinInterval;

    const $wheel = $('#wheel');
    const totalSlices = 8;
    const sliceAngle = 360 / totalSlices;

    function getAngle(x, y) {
        return Math.atan2(y - center.y, x - center.x) * (180 / Math.PI);
    }

    $wheel.on('mousedown', function (e) {
        const offset = $wheel.offset();
        center.x = offset.left + $wheel.width() / 2;
        center.y = offset.top + $wheel.height() / 2;

        isDragging = true;
        lastAngle = getAngle(e.pageX, e.pageY);
        lastTimestamp = Date.now();
        clearInterval(spinInterval);

        $wheel.addClass('dragging');
    });

    $(document).on('mousemove', function (e) {
        if (!isDragging) return;

        const currentAngle = getAngle(e.pageX, e.pageY);
        const delta = currentAngle - lastAngle;

        // Fix for crossing 180/-180 degrees
        const correctedDelta = ((delta + 540) % 360) - 180;

        currentRotation += correctedDelta;
        $wheel.css('transform', `rotate(${currentRotation}deg)`);

        const now = Date.now();
        velocity = correctedDelta / (now - lastTimestamp) * 16; // approx px per frame
        lastAngle = currentAngle;
        lastTimestamp = now;
    });

    $(document).on('mouseup', function () {
        if (!isDragging) return;
        isDragging = false;

        $wheel.removeClass('dragging');

        let spinSpeed = velocity * 10;
        const friction = 0.95;

        let lastTickedSlice = -1;

        spinInterval = setInterval(() => {
            currentRotation += spinSpeed;
            $wheel.css('transform', `rotate(${currentRotation}deg)`);

            spinSpeed *= friction;

            // 🔊 Tick every time we enter a new slice
            const normalized = (360 - (currentRotation % 360) + 360) % 360;
            const currentSlice = Math.floor(normalized / sliceAngle);
            if (currentSlice !== lastTickedSlice) {
                document.getElementById('tick-sound').currentTime = 0;
                document.getElementById('tick-sound').play();
                lastTickedSlice = currentSlice;
            }

            if (Math.abs(spinSpeed) < 0.1) {
                clearInterval(spinInterval);

                // 🔔 Play ding at end
                document.getElementById('ding-sound').play();

                const selectedIndex = Math.floor(normalized / sliceAngle);
                const selectedNumber = selectedIndex + 1;
                $("#slidedTo").html(selectedNumber);
            }
        }, 16);
    });

    $wheel.on('dragstart', e => e.preventDefault());
});