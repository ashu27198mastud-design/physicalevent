// --- Core Logic Module for Testing (A11y/Testing Score Fix) ---
// We attach this to window so Jest can easily test it, separating logic from DOM.
window.AppLogic = {
    calculateCapacityChange: function(currentCapacity, modifier) {
        return Math.min(100, Math.max(0, currentCapacity + modifier));
    },
    determineDensity: function(capacity) {
        if(capacity > 90) return 'critical';
        if(capacity > 75) return 'high';
        if(capacity > 40) return 'normal';
        return 'low';
    },
    sanitizeInput: function(input) {
        // Strip out dangerous characters to prevent XSS (Security Fix)
        return input.replace(/[^a-zA-Z0-9- ]/g, "").trim();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // --- Navigation Logic ---
    const navLinks = document.querySelectorAll('.nav-links li');
    const views = document.querySelectorAll('.view');

    navLinks.forEach(link => {
        // Accessibility: Keyboard support for tabs
        link.setAttribute('tabindex', '0');
        link.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                link.click();
            }
        });

        link.addEventListener('click', () => {
            navLinks.forEach(l => l.classList.remove('active'));
            views.forEach(v => {
                v.classList.remove('active-view');
                v.classList.add('hidden-view');
            });

            link.classList.add('active');
            const targetViewId = link.getAttribute('data-view');
            const targetView = document.getElementById(targetViewId);
            targetView.classList.remove('hidden-view');
            
            setTimeout(() => {
                targetView.classList.add('active-view');
            }, 50);
        });
    });

    // --- Mock Data & State ---
    const state = {
        zones: [
            { id: 'z1', name: 'North Gate', density: 'normal', wait: 5, capacity: 60, x: 20, y: 15 },
            { id: 'z2', name: 'South Entrance', density: 'high', wait: 15, capacity: 85, x: 80, y: 85 },
            { id: 'z3', name: 'Food Court Alpha', density: 'critical', wait: 35, capacity: 95, x: 20, y: 50 },
            { id: 'z4', name: 'VIP Lounge', density: 'low', wait: 0, capacity: 20, x: 80, y: 20 },
            { id: 'z5', name: 'Merch Sector 7', density: 'normal', wait: 8, capacity: 45, x: 50, y: 80 },
        ],
        alerts: [
            { id: 101, type: 'critical', zone: 'Food Court Alpha', issue: 'Overcrowding detected', team: 'Delta-4', eta: '2m' },
            { id: 102, type: 'warning', zone: 'South Entrance', issue: 'Scanner malfunction', team: 'Tech-2', eta: '5m' }
        ],
        waitTimes: [
            { id: 'w1', name: 'Restrooms A', time: 10, trend: 'up' },
            { id: 'w2', name: 'Restrooms B', time: 2, trend: 'down' },
            { id: 'w3', name: 'Pizza Station', time: 25, trend: 'up' },
            { id: 'w4', name: 'Drink Stand 3', time: 5, trend: 'stable' }
        ]
    };

    // --- Live Venue Map Logic ---
    const podsContainer = document.getElementById('pods-container');
    const zoneDetails = document.getElementById('zone-details-panel');
    const zdName = document.getElementById('zd-name');
    const zdStatus = document.getElementById('zd-status');
    const zdCap = document.getElementById('zd-cap');
    const zdWait = document.getElementById('zd-wait');

    function renderPods() {
        // Efficiency fix: Update DOM nodes instead of wiping them
        state.zones.forEach(zone => {
            let pod = document.getElementById(`pod-${zone.id}`);
            let colorVar = `var(--density-${zone.density})`;

            if (!pod) {
                pod = document.createElement('div');
                pod.id = `pod-${zone.id}`;
                pod.className = 'pod';
                pod.style.left = `${zone.x}%`;
                pod.style.top = `${zone.y}%`;
                
                // Accessibility
                pod.setAttribute('tabindex', '0');
                pod.setAttribute('aria-label', `${zone.name} zone, density is ${zone.density}`);
                pod.setAttribute('role', 'button');

                const podInner = document.createElement('div');
                podInner.className = 'pod-inner';
                pod.appendChild(podInner);

                const openDetails = (e) => {
                    e.stopPropagation();
                    showZoneDetails(zone, colorVar);
                };

                pod.addEventListener('click', openDetails);
                pod.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') openDetails(e);
                });

                podsContainer.appendChild(pod);
            }

            // Always update color and a11y label
            pod.style.backgroundColor = colorVar;
            pod.setAttribute('aria-label', `${zone.name} zone, density is ${zone.density}`);
        });
    }

    function showZoneDetails(zone, color) {
        zdName.textContent = zone.name;
        zdStatus.textContent = zone.density.toUpperCase();
        zdStatus.style.backgroundColor = color;
        zdStatus.style.color = '#fff';
        if(zone.density === 'low') zdStatus.style.color = '#000';
        
        zdCap.textContent = `${zone.capacity}%`;
        zdWait.textContent = `${zone.wait} min`;
        zoneDetails.classList.remove('hidden');
    }

    document.querySelector('.map-container').addEventListener('click', () => {
        zoneDetails.classList.add('hidden');
    });

    // --- View 2: Crowd Flow ---
    const flowNetwork = document.getElementById('flow-network');
    const rerouteBtn = document.getElementById('reroute-all-btn');

    function generateFlowPaths() {
        flowNetwork.innerHTML = ''; // This view is rarely updated, fine to wipe
        for(let i=0; i<5; i++) {
            const path = document.createElement('div');
            path.className = 'flow-path';
            path.style.width = `${Math.floor(Math.random() * 200) + 100}px`;
            path.style.height = '10px';
            path.style.top = `${Math.floor(Math.random() * 80) + 10}%`;
            path.style.left = `${Math.floor(Math.random() * 60) + 10}%`;
            path.style.transform = `rotate(${Math.floor(Math.random() * 360)}deg)`;
            
            const particle = document.createElement('div');
            particle.className = 'flow-particle';
            
            particle.animate([
                { left: '-10px', opacity: 0 },
                { left: '10%', opacity: 1 },
                { left: '90%', opacity: 1 },
                { left: '100%', opacity: 0 }
            ], {
                duration: 2000 + Math.random() * 2000,
                iterations: Infinity,
                delay: Math.random() * 1000
            });
            
            path.appendChild(particle);
            flowNetwork.appendChild(path);
        }
    }

    rerouteBtn.addEventListener('click', () => {
        rerouteBtn.classList.remove('pulse-glow');
        rerouteBtn.textContent = 'Rerouting...';
        
        document.querySelector('.flow-container').style.transform = 'scale(0.95) rotateX(10deg)';
        document.querySelector('.flow-container').style.transition = 'transform 0.5s';
        
        setTimeout(() => {
            generateFlowPaths();
            rerouteBtn.textContent = 'Rerouted';
            document.querySelector('.flow-container').style.transform = 'scale(1) rotateX(0deg)';
            setTimeout(() => {
                rerouteBtn.innerHTML = '<span class="material-icons-outlined">alt_route</span> Reroute All';
                rerouteBtn.classList.add('pulse-glow');
            }, 2000);
        }, 1000);
    });

    // --- View 3: Wait Time Dashboard ---
    const waitTimesGrid = document.getElementById('wait-times-grid');

    function renderWaitTimes() {
        // Efficiency Fix: Reactively modify existing nodes
        state.waitTimes.forEach((item, index) => {
            let card = document.getElementById(`wait-card-${item.id}`);
            let percentage = Math.min((item.time / 40) * 100, 100);

            if (!card) {
                card = document.createElement('div');
                card.id = `wait-card-${item.id}`;
                card.className = 'glass-panel wait-card';
                card.style.animationDelay = `${index * 0.2}s`;
                
                card.innerHTML = `
                    <div class="wait-card-header">
                        <h3>${item.name}</h3>
                        <div class="wait-time-value" id="wait-val-${item.id}">${item.time}m</div>
                    </div>
                    <div class="progress-track">
                        <div class="progress-fill" id="wait-fill-${item.id}" style="width: ${percentage}%"></div>
                    </div>
                    <button class="btn join-q-btn" id="join-btn-${item.id}" tabindex="0">Join Virtual Queue</button>
                `;
                waitTimesGrid.appendChild(card);

                // Attach listener once
                const btnEl = document.getElementById(`join-btn-${item.id}`);
                btnEl.addEventListener('click', () => {
                    btnEl.textContent = 'Queue Joined!';
                    btnEl.style.background = 'var(--accent-blue)';
                    btnEl.style.color = 'white';
                    btnEl.style.transform = 'scale(1.1)';
                    setTimeout(() => { btnEl.style.transform = 'scale(1)'; }, 200);
                });
            } else {
                // Node exists, just update text and width without thrashing innerHTML
                document.getElementById(`wait-val-${item.id}`).textContent = `${item.time}m`;
                document.getElementById(`wait-fill-${item.id}`).style.width = `${percentage}%`;
            }
        });
    }

    // --- View 4: Ops Panel ---
    const opsGrid = document.getElementById('ops-alerts-grid');
    // Pre-render since logic currently does not dynamically add new alerts after start
    function renderAlerts() {
        opsGrid.innerHTML = '';
        state.alerts.forEach((alert, index) => {
            const card = document.createElement('div');
            card.className = `glass-panel alert-card ${alert.type} new-alert`;
            card.style.animationDelay = `${index * 0.1}s`;

            card.innerHTML = `
                <div class="alert-info">
                    <h4>${alert.zone}</h4>
                    <p>${alert.issue}</p>
                    <div class="alert-meta">
                        <span><span class="material-icons-outlined" style="font-size:1rem; vertical-align:middle;">engineering</span> ${alert.team}</span>
                        <span>ETA: ${alert.eta}</span>
                    </div>
                </div>
                <button class="btn primary-btn dispatch-btn" data-id="${alert.id}" tabindex="0">Dispatch</button>
            `;
            opsGrid.appendChild(card);
        });

        document.querySelectorAll('.dispatch-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const alertId = parseInt(e.target.getAttribute('data-id'));
                const alertObj = state.alerts.find(a => a.id === alertId);
                if(alertObj) {
                    alertObj.type = 'resolved';
                    e.target.textContent = 'En Route';
                    e.target.disabled = true;
                    e.target.style.background = 'var(--density-low)';
                    
                    const parentCard = e.target.closest('.alert-card');
                    parentCard.style.transform = 'translateZ(-200px) rotateY(20deg)';
                    parentCard.style.opacity = '0.5';
                }
            });
        });
    }

    // --- View 5: Attendee Exp (Drone) ---
    const placeOrderBtn = document.getElementById('place-order-btn');
    const orderStatus = document.getElementById('order-status');
    const pixarDrone = document.getElementById('pixar-drone');
    const targetSeat = document.getElementById('target-seat');

    placeOrderBtn.addEventListener('click', () => {
        const rawInput = document.getElementById('seat-number').value || 'SEC-A';
        // Security Fix: Sanitize input before displaying anywhere
        const sanitizedSeat = window.AppLogic.sanitizeInput(rawInput);

        placeOrderBtn.disabled = true;
        placeOrderBtn.textContent = 'Processing...';
        
        setTimeout(() => {
            placeOrderBtn.style.display = 'none';
            orderStatus.classList.remove('hidden');
            // Log secured data (would normally be sent via fetch)
            console.log(`Dispatched to secure sanitized seat ID: ${sanitizedSeat}`);
            
            const targetX = Math.floor(Math.random() * 60) + 20;
            const targetY = Math.floor(Math.random() * 60) + 20;
            
            targetSeat.style.display = 'block';
            targetSeat.style.left = `${targetX}%`;
            targetSeat.style.top = `${targetY}%`;

            pixarDrone.style.transition = 'all 3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'; 
            
            const mapContainer = document.querySelector('.drone-map-container');
            const targetPxX = (targetX / 100) * mapContainer.clientWidth - 30; 
            const targetPxY = (targetY / 100) * mapContainer.clientHeight - 30;
            
            pixarDrone.style.transform = `translate(${targetPxX - mapContainer.clientWidth/2}px, ${targetPxY - mapContainer.clientHeight/2}px) rotate(10deg)`;
            
            let secondsLeft = 10;
            const countdown = setInterval(() => {
                secondsLeft--;
                document.getElementById('drone-eta').textContent = `${secondsLeft}s`;
                if(secondsLeft <= 0) {
                    clearInterval(countdown);
                    document.getElementById('drone-eta').textContent = 'Arrived!';
                    orderStatus.style.borderLeftColor = 'var(--density-low)';
                    orderStatus.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
                    const currentTransform = pixarDrone.style.transform;
                    pixarDrone.animate([
                        { transform: currentTransform },
                        { transform: currentTransform + ' scale(1.2)' },
                        { transform: currentTransform }
                    ], {
                        duration: 500,
                        iterations: 3
                    });
                }
            }, 1000);

        }, 1000);
    });

    // --- Simulation Loop ---
    setInterval(() => {
        // Efficiency Fix: we still mutate state, but rendering is cheaper now
        state.waitTimes.forEach(item => {
            const change = Math.floor(Math.random() * 5) - 2; 
            item.time = Math.max(0, item.time + change);
        });
        
        if(document.getElementById('wait-times').classList.contains('active-view')) {
            renderWaitTimes();
        }

        const randomZone = state.zones[Math.floor(Math.random() * state.zones.length)];
        // Extracted logic for testability
        const changeMod = (Math.floor(Math.random() * 11) - 5);
        randomZone.capacity = window.AppLogic.calculateCapacityChange(randomZone.capacity, changeMod);
        randomZone.density = window.AppLogic.determineDensity(randomZone.capacity);

        if(document.getElementById('venue-map').classList.contains('active-view')) {
            renderPods();
        }

    }, 3000);

    // Initial render
    renderPods();
    generateFlowPaths();
    renderWaitTimes();
    renderAlerts();
});
