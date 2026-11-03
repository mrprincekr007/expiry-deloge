
        function escapeHtml(str) {
            return String(str == null ? '' : str).replace(/[&<>"']/g, function(c) {
                return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
            });
        }

        var users = [];
        var usersRef = db.ref('admin_control/users');
        var usersListener = null;

        function switchPage(pageId) {
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('.t-nav').forEach(n => n.classList.remove('active'));
            document.getElementById('page-' + pageId).classList.add('active');
            var navItems = document.querySelectorAll('.t-nav');
            for (var i = 0; i < navItems.length; i++) {
                if (navItems[i].getAttribute('onclick') && navItems[i].getAttribute('onclick').includes(pageId)) {
                    navItems[i].classList.add('active');
                    break;
                }
            }
            document.getElementById('mobileNav').classList.remove('show');
            if (pageId === 'settings') { renderUsers(); }
            if (pageId === 'manage-apps') { loadAppsList(); }
            if (pageId === 'support') { loadSupportSettings(); loadTickets(); }
            if (pageId === 'announcements') { renderAdminNotifs(); }
        }

        function switchPageMobile(pageId) {
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('.m-nav').forEach(n => n.classList.remove('active'));
            document.getElementById('page-' + pageId).classList.add('active');
            var mNavs = document.querySelectorAll('.m-nav');
            for (var i = 0; i < mNavs.length; i++) {
                if (mNavs[i].getAttribute('onclick') && mNavs[i].getAttribute('onclick').includes(pageId)) {
                    mNavs[i].classList.add('active');
                    break;
                }
            }
            document.getElementById('mobileNav').classList.remove('show');
            if (pageId === 'settings') { renderUsers(); }
            if (pageId === 'manage-apps') { loadAppsList(); }
            if (pageId === 'support') { loadSupportSettings(); loadTickets(); }
            if (pageId === 'announcements') { renderAdminNotifs(); }
        }

        function toggleMobileNav() {
            document.getElementById('mobileNav').classList.toggle('show');
        }

        function saveRemember() {
            if (document.getElementById('rememberMe').checked) {
                localStorage.setItem('adminRemembered', JSON.stringify({ email: document.getElementById('loginEmail').value.trim(), pass: document.getElementById('loginPass').value }));
            } else { localStorage.removeItem('adminRemembered'); }
        }

        function loadRemember() {
            var saved = localStorage.getItem('adminRemembered');
            if (saved) { try { var d = JSON.parse(saved); document.getElementById('loginEmail').value = d.email || ''; document.getElementById('loginPass').value = d.pass || ''; document.getElementById('rememberMe').checked = true; } catch(e) {} }
        }

        function adminLogin() {
            var email = document.getElementById('loginEmail').value.trim();
            var pass = document.getElementById('loginPass').value;
            var err = document.getElementById('loginError');
            err.style.display = 'none';
            if (!email || !pass) { err.textContent = 'Enter email and password!'; err.style.display = 'block'; return; }
            saveRemember();
            auth.signInWithEmailAndPassword(email, pass).then(function(cred) {
                document.getElementById('loginOverlay').classList.add('hidden');
                loadAdminInfo(cred.user);
                loadDashboard();
            }).catch(function(error) { err.textContent = error.message; err.style.display = 'block'; });
        }

        auth.onAuthStateChanged(function(user) {
            if (user) {
                var stored = localStorage.getItem('adminSessionTime');
                var now = Date.now();
                if (!stored) {
                    localStorage.setItem('adminSessionTime', String(now));
                } else if (now - parseInt(stored, 10) >= 24 * 60 * 60 * 1000) {
                    localStorage.removeItem('adminSessionTime');
                    auth.signOut();
                    return;
                }
                document.getElementById('loginOverlay').classList.add('hidden');
                loadAdminInfo(user);
                loadDashboard();
                startUsersListener();
            }
            else {
                localStorage.removeItem('adminSessionTime');
                document.getElementById('loginOverlay').classList.remove('hidden');
                loadRemember();
                if (usersListener) { usersRef.off('value', usersListener); usersListener = null; }
            }
        });

        setInterval(function() {
            var stored = localStorage.getItem('adminSessionTime');
            if (stored && Date.now() - parseInt(stored, 10) >= 24 * 60 * 60 * 1000) {
                localStorage.removeItem('adminSessionTime');
                auth.signOut();
            }
        }, 60000);

        function loadAdminInfo(user) {
            var name = user.email ? user.email.split('@')[0] : 'Admin';
            document.getElementById('sidebarName').textContent = name;
            document.getElementById('sidebarEmail').textContent = user.email;
            document.getElementById('adminAvatar').textContent = name.charAt(0).toUpperCase();
            document.getElementById('infoEmail').textContent = user.email;
            document.getElementById('infoUid').textContent = user.uid;
        }

        function loadDashboard() {
            document.getElementById('updateTime').textContent = new Date().toLocaleTimeString('en-IN');
            db.ref('app_control/apps').once('value', function(snapshot) {
                var total = 0, active = 0, expired = 0, now = Date.now();
                snapshot.forEach(function(child) {
                    var data = child.val(); total++;
                    (data.status === 'Expired' || (data.expiryTime > 0 && now > data.expiryTime)) ? expired++ : active++;
                });
                document.getElementById('statTotal').textContent = total;
                document.getElementById('statActive').textContent = active;
                document.getElementById('statExpired').textContent = expired;
                document.getElementById('navTotal').textContent = total;
                document.getElementById('mNavTotal').textContent = total;
                loadAppsList();
            });
        }

        function loadAppsList() {
            appsCache = null;
            var container = document.getElementById('appListContainer');
            db.ref('app_control/apps').orderByChild('timestamp').once('value', function(snapshot) {
                var apps = [];
                snapshot.forEach(function(child) { var data = child.val(); data.code = child.key; data.deviceCount = data.devices ? Object.keys(data.devices).length : 0; apps.push(data); });
                apps.reverse();
                if (apps.length === 0) { container.innerHTML = '<li style="text-align:center;color:#555;padding:30px;"><i class="fas fa-inbox" style="margin-right:8px;"></i> No apps found.</li>'; return; }
                var html = '', now = Date.now();
                apps.forEach(function(app) {
                    var expired = (app.status === 'Expired' || (app.expiryTime > 0 && now > app.expiryTime));
                    var badge = expired ? 'b-expired' : 'b-active';
                    var status = expired ? 'Expired' : 'Active';
                    var expText = app.expiryTime > 0 ? new Date(app.expiryTime).toLocaleString('en-IN') : 'No limit';
                    var ownerTxt = app.owner ? ' &middot; Owner: ' + app.owner : '';
                    var deviceTxt = app.deviceCount > 0 ? ' &middot; <span style="color:#00D2FF;">&#128241; ' + app.deviceCount + ' device' + (app.deviceCount > 1 ? 's' : '') + '</span>' : ' &middot; <span style="color:#888;">&#128241; 0 devices</span>';
                    var statusBtn = expired
                        ? '<button class="btn-sm" onclick="setAppStatus(\'' + app.code + '\',\'Active\')" style="background:rgba(0,230,118,0.15);color:#00E676;border:none;border-radius:8px;padding:8px 12px;cursor:pointer;" title="Set Active"><i class="fas fa-check"></i></button>'
                        : '<button class="btn-sm" onclick="setAppStatus(\'' + app.code + '\',\'Expired\')" style="background:rgba(255,76,76,0.15);color:#FF4C4C;border:none;border-radius:8px;padding:8px 12px;cursor:pointer;" title="Set Expired"><i class="fas fa-ban"></i></button>';
                    html += '<li class="app-item"><div class="app-info"><h4>' + app.name + ' <span class="badge ' + badge + '">' + status + '</span></h4><p>' + app.code + ' &middot; Expiry: ' + expText + ownerTxt + deviceTxt + '</p></div><div class="app-controls" style="display:flex;gap:6px;">' +
                        statusBtn +
                        '<button class="btn-sm" onclick="viewAppCode(\'' + app.code + '\')" style="background:rgba(52,152,219,0.15);color:#3498db;border:none;border-radius:8px;padding:8px 12px;cursor:pointer;" title="View Code"><i class="fas fa-code"></i></button>' +
                        '<button class="btn-sm" onclick="viewAppDevices(\'' + app.code + '\')" style="background:rgba(0,210,255,0.15);color:#00D2FF;border:none;border-radius:8px;padding:8px 12px;cursor:pointer;" title="View Devices"><i class="fas fa-mobile-alt"></i></button>' +
                        '<button class="btn-sm" onclick="deleteApp(\'' + app.code + '\')" style="background:rgba(255,76,76,0.15);color:#FF4C4C;border:none;border-radius:8px;padding:8px 12px;cursor:pointer;" title="Delete"><i class="fas fa-trash"></i></button></div></li>';
                });
                container.innerHTML = html;
            });
        }

        function setAppStatus(code, status) {
            appsCache = null;
            db.ref('app_control/apps/' + code).update({ status: status }).then(function() {
                showToast('App set to ' + status + '!');
                loadDashboard();
            });
        }

        function deleteApp(code) {
            appsCache = null;
            if (!confirm('Delete this app?')) return;
            db.ref('app_control/apps/' + code).remove().then(function() {
                showToast('App deleted!');
                loadDashboard();
            });
        }

        function viewAppCode(code) {
            db.ref('app_control/apps/' + code + '/javacode').once('value', function(snapshot) {
                var codeData = snapshot.val();
                if (codeData) {
                    document.getElementById('appCodeText').textContent = codeData;
                    document.getElementById('appCodeModal').classList.add('show');
                } else { showToast('No code found for this app!'); }
            });
        }

        function viewAppDevices(code) {
            db.ref('app_control/apps/' + code + '/devices').once('value', function(snapshot) {
                var container = document.getElementById('appDevicesText');
                var data = snapshot.val() || {};
                var keys = Object.keys(data);
                if (keys.length === 0) {
                    container.innerHTML = '<p style="color:#555;padding:20px;text-align:center;">No device has used this key yet.</p>';
                } else {
                    var html = '<div style="font-size:12px;color:#00D2FF;margin-bottom:10px;">Total Devices: <b>' + keys.length + '</b></div>';
                    keys.forEach(function(k) {
                        var d = data[k];
                        var model = d.model || 'Unknown device';
                        var first = d.firstSeen ? new Date(d.firstSeen).toLocaleString('en-IN') : '—';
                        var last = d.lastSeen ? new Date(d.lastSeen).toLocaleString('en-IN') : '—';
                        html += '<div style="background:rgba(11,5,20,0.5);border:1px solid rgba(179,102,255,0.1);border-radius:10px;padding:10px 12px;margin-bottom:8px;">' +
                            '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;">' +
                            '<b style="color:#C792EA;font-size:12px;"><i class="fas fa-mobile-alt" style="margin-right:5px;"></i>' + model + '</b>' +
                            '<button class="btn-sm" onclick="deleteDevice(\'' + code + '\',\'' + k + '\')" style="background:rgba(255,76,76,0.15);color:#FF4C4C;border:none;border-radius:8px;padding:5px 10px;cursor:pointer;font-size:11px;"><i class="fas fa-trash"></i> Remove</button></div>' +
                            '<div style="font-size:10px;color:#888;margin-top:4px;">ID: <span style="color:#AAA;">' + k + '</span></div>' +
                            '<div style="font-size:10px;color:#888;">First: ' + first + '</div>' +
                            '<div style="font-size:10px;color:#888;">Last: ' + last + '</div></div>';
                    });
                    container.innerHTML = html;
                }
                document.getElementById('appDevicesModal').classList.add('show');
            });
        }

        function deleteDevice(code, deviceId) {
            if (!confirm('Remove this device from key?')) return;
            db.ref('app_control/apps/' + code + '/devices/' + deviceId).remove().then(function() {
                showToast('Device removed!');
                loadDashboard();
            });
        }

        function copyAppCode() {
            var text = document.getElementById('appCodeText').textContent;
            if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).then(function() { showToast('Code copied!'); }); }
            else {
                var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
                try { document.execCommand('copy'); } catch(e) {}
                document.body.removeChild(ta); showToast('Code copied!');
            }
        }

        // --- SUPPORT & TICKETS (ADMIN) ---
        var ticketsListener = null;

        function esc(str) {
            return String(str == null ? '' : str).replace(/[&<>"']/g, function(c) {
                return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
            });
        }

        function loadSupportSettings() {
            db.ref('support_config').once('value', function(snap) {
                var c = snap.val() || {};
                document.getElementById('supDevNameInput').value = c.devName || 'PRINCE HACKS';
                document.getElementById('supWaInput').value = c.whatsapp || '';
                document.getElementById('supTgInput').value = c.telegram || '';
            });
        }

        function saveSupportSettings() {
            var dev = document.getElementById('supDevNameInput').value.trim() || 'PRINCE HACKS';
            var wa = document.getElementById('supWaInput').value.trim();
            var tg = document.getElementById('supTgInput').value.trim();
            db.ref('support_config').set({ devName: dev, whatsapp: wa, telegram: tg }).then(function() {
                showToast('Support settings saved!');
            });
        }

        function loadTickets() {
            if (ticketsListener) { db.ref('support_tickets').off('value', ticketsListener); ticketsListener = null; }
            var container = document.getElementById('ticketsListContainer');
            ticketsListener = db.ref('support_tickets').orderByChild('timestamp').on('value', function(snapshot) {
                var tickets = [];
                snapshot.forEach(function(child) { var t = child.val(); t._key = child.key; tickets.push(t); });
                tickets.reverse();
                document.getElementById('ticketCount').textContent = '(' + tickets.length + ')';
                if (tickets.length === 0) { container.innerHTML = '<li style="text-align:center;color:#555;padding:30px;"><i class="fas fa-inbox" style="margin-right:8px;"></i> No tickets yet.</li>'; return; }
                var html = '';
                tickets.forEach(function(t) {
                    var statusBadge = t.status === 'resolved' ? '<span class="badge b-active">RESOLVED</span>' : '<span class="badge b-expired">OPEN</span>';
                    html += '<li class="app-item" style="flex-direction:column;align-items:stretch;">' +
                        '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;"><h4>' + esc(t.subject) + ' ' + statusBadge + '</h4><div style="display:flex;gap:6px;">' +
                        (t.status === 'resolved'
                            ? '<button class="btn-sm" onclick="setTicketStatus(\'' + t._key + '\',\'open\')" style="background:rgba(255,179,0,0.15);color:#FFB300;border:none;border-radius:8px;padding:8px 12px;cursor:pointer;"><i class="fas fa-redo"></i> Reopen</button>'
                            : '<button class="btn-sm" onclick="setTicketStatus(\'' + t._key + '\',\'resolved\')" style="background:rgba(0,230,118,0.15);color:#00E676;border:none;border-radius:8px;padding:8px 12px;cursor:pointer;"><i class="fas fa-check"></i> Resolve</button>') +
                        '<button class="btn-sm" onclick="deleteTicket(\'' + t._key + '\')" style="background:rgba(255,76,76,0.15);color:#FF4C4C;border:none;border-radius:8px;padding:8px 12px;cursor:pointer;" title="Delete Ticket"><i class="fas fa-trash"></i></button>' +
                        '</div></div>' +
                        '<p style="font-size:11px;color:#888;margin-top:2px;">From: <b style="color:#C792EA;">' + esc(t.user) + '</b> &middot; ' + new Date(t.timestamp).toLocaleString('en-IN') + '</p>' +
                        '<p style="font-size:13px;color:#ddd;margin-top:6px;background:rgba(11,5,20,0.5);padding:10px;border-radius:10px;">' + esc(t.message) + '</p>';
                    var replies = t.replies || {};
                    var keys = Object.keys(replies).sort();
                    if (keys.length > 0) {
                        html += '<div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(179,102,255,0.08);">';
                        keys.forEach(function(k) {
                            var r = replies[k];
                            var who = r.from === 'admin' ? 'Admin' : t.user;
                            var color = r.from === 'admin' ? '#00E676' : '#C792EA';
                            html += '<div style="font-size:12px;margin-bottom:5px;color:' + color + ';"><b>' + who + ':</b> ' + esc(r.text) + '</div>';
                        });
                        html += '</div>';
                    }
                    html += '<div style="display:flex;gap:8px;margin-top:10px;">' +
                        '<input type="text" id="ticketReply_' + t._key + '" placeholder="Type reply..." style="flex:1;background:rgba(11,5,20,0.5);border:1px solid rgba(179,102,255,0.15);border-radius:8px;padding:10px;color:#fff;padding-left:15px;" onkeydown="if(event.key===\'Enter\'){sendAdminReply(\'' + t._key + '\')}">' +
                        '<button class="btn-sm" onclick="sendAdminReply(\'' + t._key + '\')" style="background:rgba(179,102,255,0.15);color:#B366FF;border:none;border-radius:8px;padding:8px 14px;cursor:pointer;"><i class="fas fa-reply"></i> Reply</button></div></li>';
                });
                container.innerHTML = html;
            });
        }

        function sendAdminReply(key) {
            var inp = document.getElementById('ticketReply_' + key);
            if (!inp) return;
            var text = inp.value.trim();
            if (!text) { showToast('Type a reply first!'); return; }
            db.ref('support_tickets/' + key).once('value', function(snap) {
                var t = snap.val() || {};
                db.ref('support_tickets/' + key + '/replies/' + Date.now()).set({ from: 'admin', text: text, time: Date.now() }).then(function() {
                    if (t.user) {
                        db.ref('notifications').push({
                            text: 'Admin replied to your ticket: "' + (t.subject || 'Your Ticket') + '"',
                            time: Date.now(),
                            from: 'ADMIN',
                            target: 'user',
                            user: t.user
                        });
                    }
                    showToast('Reply sent to user!');
                });
            });
        }

        function setTicketStatus(key, status) {
            db.ref('support_tickets/' + key).update({ status: status }).then(function() {
                showToast('Ticket ' + status + '!');
            });
        }

        function deleteTicket(key) {
            if (!confirm('Delete this ticket permanently?')) return;
            db.ref('support_tickets/' + key).remove().then(function() {
                showToast('Ticket deleted!');
            });
        }

        // --- USER MANAGEMENT (Firebase) ---
        function startUsersListener() {
            usersListener = usersRef.on('value', function(snapshot) {
                users = [];
                snapshot.forEach(function(child) {
                    var user = child.val();
                    user._key = child.key;
                    users.push(user);
                });
                // If settings page is active, re-render
                var settingsPage = document.getElementById('page-settings');
                if (settingsPage && settingsPage.classList.contains('active')) renderUsers();
                var detailsPage = document.getElementById('page-user-details');
                if (detailsPage && detailsPage.classList.contains('active') && currentDetailUserKey) renderUserDetails();
            });
        }

        function renderUsers() {
            var container = document.getElementById('userListContainer');
            document.getElementById('userCount').textContent = '(' + users.length + ')';
            if (users.length === 0) { container.innerHTML = '<li style="text-align:center;color:#555;padding:30px;"><i class="fas fa-users" style="margin-right:8px;"></i> No users added yet.</li>'; return; }
            var html = '';
            users.forEach(function(user, i) {
                var lockedArr = user.lockedDevices || [];
                var devCount = lockedArr.length;
                var limitTxt = user.deviceLimit > 0 ? user.deviceLimit + ' Device' + (user.deviceLimit > 1 ? 's' : '') : 'Unlimited';
                var passIcon = user.canChangePassword ? '<span style="color:#00E676;margin-left:6px;" title="Password Change Allowed">&#9679;</span>' : '<span style="color:#FF4C4C;margin-left:6px;" title="Password Change Blocked">&#9675;</span>';
                var profIcon = user.profileEdit === false ? '<span style="margin-left:6px;" title="Profile Edit Blocked">&#128274;</span>' : '';
                var p = user.profile || {};
                var profParts = [];
                if (p.name) profParts.push('<b>Name:</b> ' + escapeHtml(p.name));
                if (p.contact) profParts.push('<b>Contact:</b> ' + escapeHtml(p.contact));
                if (p.youtube) profParts.push('<b>YouTube:</b> ' + escapeHtml(p.youtube));
                if (p.telegram) profParts.push('<b>Telegram:</b> ' + escapeHtml(p.telegram));
                var statusDot = user.online ? '<span style="color:#00E676;margin-right:4px;" title="Online">&#9679;</span>' : '<span style="color:#777;margin-right:4px;" title="Offline">&#9675;</span>';
                var devTxt = devCount > 0 ? ' &middot; <span style="color:#00D2FF;">&#128241; ' + devCount + ' device' + (devCount > 1 ? 's' : '') + ' login</span>' : ' &middot; <span style="color:#888;">&#128241; 0 devices login</span>';
                html += '<li class="app-item"><div class="app-info"><h4>' + statusDot + user.username + passIcon + profIcon + ' <span class="badge b-active">Active</span></h4><p>Pass: ' + user.password + ' &middot; ' + (user.device || 'No details') + ' &middot; Limit: ' + limitTxt + devTxt + '</p><div style="font-size:11px;color:#AAA;margin-top:4px;word-break:break-word;overflow-wrap:anywhere;">' + (profParts.length ? profParts.join(' &middot; ') : '<span style="color:#777;">No profile details</span>') + '</div></div><div class="app-controls" style="display:flex;gap:6px;">' +
                    '<button class="btn-sm" onclick="showUserDetails(\'' + user._key + '\')" style="background:rgba(0,210,255,0.15);color:#00D2FF;border:none;border-radius:8px;padding:8px 12px;cursor:pointer;" title="View Details"><i class="fas fa-eye"></i></button>' +
                    '<button class="btn-sm" onclick="viewUserDevices(\'' + user._key + '\', true)" style="background:rgba(0,210,255,0.15);color:#00D2FF;border:none;border-radius:8px;padding:8px 12px;cursor:pointer;" title="View Login Devices"><i class="fas fa-mobile-alt"></i></button>' +
                    (devCount > 0 ? '<button class="btn-sm" onclick="resetDevice(\'' + user._key + '\')" style="background:rgba(255,179,0,0.15);color:#FFB300;border:none;border-radius:8px;padding:8px 12px;cursor:pointer;" title="Reset All Devices"><i class="fas fa-unlock"></i></button>' : '') +
                    '<button class="btn-sm" onclick="editUser(\'' + user._key + '\')" style="background:rgba(255,179,0,0.15);color:#FFB300;border:none;border-radius:8px;padding:8px 12px;cursor:pointer;"><i class="fas fa-pen"></i></button>' +
                    '<button class="btn-sm" onclick="deleteUser(\'' + user._key + '\')" style="background:rgba(255,76,76,0.15);color:#FF4C4C;border:none;border-radius:8px;padding:8px 12px;cursor:pointer;"><i class="fas fa-trash"></i></button></div></li>';
            });
            container.innerHTML = html;
        }

        var currentDetailUserKey = null;
        var appsCache = null;

        function timeAgo(ms) {
            var diff = Date.now() - ms;
            if (diff < 0) return 'just now';
            if (diff < 60000) return Math.floor(diff / 1000) + ' sec ago';
            if (diff < 3600000) return Math.floor(diff / 60000) + ' min ago';
            if (diff < 86400000) return Math.floor(diff / 3600000) + ' hr ago';
            return Math.floor(diff / 86400000) + ' days ago';
        }

        function presenceHtml(user) {
            if (user.online) return '<span style="color:#00E676;font-weight:700;">&#9679; ONLINE</span>';
            var last = user.lastSeen ? timeAgo(user.lastSeen) : 'never';
            return '<span style="color:#888;">&#9675; OFFLINE</span> <span style="color:#FFB300;">(last seen ' + last + ')</span>';
        }

        function showUserDetails(key) {
            currentDetailUserKey = key;
            switchPage('user-details');
            renderUserDetails();
        }

        function backToUsers() {
            switchPage('settings');
        }

        function renderUserDetails() {
            var user = null;
            for (var i = 0; i < users.length; i++) { if (users[i]._key === currentDetailUserKey) { user = users[i]; break; } }
            var accBox = document.getElementById('udAccountInfo');
            if (!user || !accBox) return;
            var lockedCount = user.lockedDevices ? user.lockedDevices.length : 0;
            var limitTxt = user.deviceLimit > 0 ? user.deviceLimit + ' Device(s)' : 'Unlimited';
            accBox.innerHTML =
                '<div class="form-group" style="margin:0;"><label>Status</label><div>' + presenceHtml(user) + '</div></div>' +
                '<div class="form-group" style="margin:0;"><label>Username</label><div style="word-break:break-word;">' + escapeHtml(user.username) + '</div></div>' +
                '<div class="form-group" style="margin:0;"><label>Password</label><div style="word-break:break-word;">' + escapeHtml(user.password || '—') + '</div></div>' +
                '<div class="form-group" style="margin:0;"><label>Password Change</label><div>' + (user.canChangePassword ? '<span style="color:#00E676;">Allowed</span>' : '<span style="color:#FF4C4C;">Blocked</span>') + '</div></div>' +
                '<div class="form-group" style="margin:0;"><label>Profile Edit</label><div>' + (user.profileEdit === false ? '<span style="color:#FF4C4C;">Blocked</span>' : '<span style="color:#00E676;">Allowed</span>') + '</div></div>' +
                '<div class="form-group" style="margin:0;"><label>Device / Details</label><div style="word-break:break-word;overflow-wrap:anywhere;">' + escapeHtml(user.device || '—') + '</div></div>' +
                '<div class="form-group" style="margin:0;"><label>Device Limit</label><div>' + limitTxt + '</div></div>' +
                '<div class="form-group" style="margin:0;"><label>Login Devices</label><div>' + lockedCount + ' <a href="javascript:void(0)" onclick="viewUserDevices(\'' + currentDetailUserKey + '\', true)" style="color:#00D2FF;font-size:11px;margin-left:6px;">(view)</a></div></div>' +
                '<div class="form-group" style="margin:0;"><label>Created</label><div>' + (user.created ? new Date(user.created).toLocaleString('en-IN') : '—') + '</div></div>';
            var p = user.profile || {};
            var profHtml = '';
            if (!p.name && !p.contact && !p.youtube && !p.telegram) {
                profHtml = '<div style="color:#777;grid-column:1/-1;">No profile details added.</div>';
            } else {
                if (p.name) profHtml += '<div class="form-group" style="margin:0;"><label>Name</label><div style="word-break:break-word;overflow-wrap:anywhere;">' + escapeHtml(p.name) + '</div></div>';
                if (p.contact) profHtml += '<div class="form-group" style="margin:0;"><label>Contact</label><div style="word-break:break-word;overflow-wrap:anywhere;">' + escapeHtml(p.contact) + '</div></div>';
                if (p.youtube) profHtml += '<div class="form-group" style="margin:0;"><label>YouTube</label><div style="word-break:break-word;overflow-wrap:anywhere;">' + escapeHtml(p.youtube) + '</div></div>';
                if (p.telegram) profHtml += '<div class="form-group" style="margin:0;"><label>Telegram</label><div style="word-break:break-word;overflow-wrap:anywhere;">' + escapeHtml(p.telegram) + '</div></div>';
            }
            document.getElementById('udProfileInfo').innerHTML = profHtml;
            if (!appsCache) loadUserApps();
            else renderUserApps(user);
        }

        function loadUserApps() {
            db.ref('app_control/apps').once('value', function(snap) {
                appsCache = [];
                snap.forEach(function(child) { var a = child.val(); a.code = child.key; a.deviceCount = a.devices ? Object.keys(a.devices).length : 0; appsCache.push(a); });
                renderUserApps(currentUserFromCache());
            });
        }

        function currentUserFromCache() {
            for (var i = 0; i < users.length; i++) { if (users[i]._key === currentDetailUserKey) return users[i]; }
            return null;
        }

        function renderUserApps(user) {
            if (!user) return;
            var myApps = [];
            for (var i = 0; i < appsCache.length; i++) { if (appsCache[i].owner === user.username) myApps.push(appsCache[i]); }
            var now = Date.now();
            var active = 0, expired = 0;
            myApps.forEach(function(a) { if (a.status === 'Expired' || (a.expiryTime > 0 && now > a.expiryTime)) expired++; else active++; });
            document.getElementById('udStats').innerHTML =
                '<div style="text-align:center;padding:14px;background:rgba(0,230,118,0.08);border:1px solid rgba(0,230,118,0.25);border-radius:12px;"><div style="font-size:26px;font-weight:800;color:#00E676;">' + myApps.length + '</div><div style="font-size:12px;color:#AAA;">Total Codes</div></div>' +
                '<div style="text-align:center;padding:14px;background:rgba(0,210,255,0.08);border:1px solid rgba(0,210,255,0.25);border-radius:12px;"><div style="font-size:26px;font-weight:800;color:#00D2FF;">' + active + '</div><div style="font-size:12px;color:#AAA;">Active</div></div>' +
                '<div style="text-align:center;padding:14px;background:rgba(255,76,76,0.08);border:1px solid rgba(255,76,76,0.25);border-radius:12px;"><div style="font-size:26px;font-weight:800;color:#FF4C4C;">' + expired + '</div><div style="font-size:12px;color:#AAA;">Expired</div></div>';
            var listBox = document.getElementById('udAppsList');
            if (myApps.length === 0) { listBox.innerHTML = '<li style="text-align:center;color:#555;padding:20px;">No online codes generated yet.</li>'; return; }
            myApps.sort(function(a, b) { return b.timestamp - a.timestamp; });
            var html = '';
            myApps.forEach(function(a) {
                var exp = (a.status === 'Expired' || (a.expiryTime > 0 && now > a.expiryTime));
                var badge = exp ? '<span style="color:#FF4C4C;">EXPIRED</span>' : '<span style="color:#00E676;">ACTIVE</span>';
                var expText = a.expiryTime > 0 ? new Date(a.expiryTime).toLocaleString('en-IN') : 'No limit';
                var devTxt = a.deviceCount > 0 ? ' &middot; <span style="color:#00D2FF;">&#128241; ' + a.deviceCount + ' device' + (a.deviceCount > 1 ? 's' : '') + '</span>' : '';
                html += '<li class="app-item"><div class="app-info"><h4>' + escapeHtml(a.name) + ' ' + badge + '</h4><p>Code: <b>' + escapeHtml(a.code) + '</b>' + devTxt + ' &middot; Created: ' + new Date(a.timestamp).toLocaleString('en-IN') + '</p><p>Expires: ' + expText + '</p></div></li>';
            });
            listBox.innerHTML = html;
        }

        function addUser() {
            var username = document.getElementById('newUsername').value.trim();            var password = document.getElementById('newPassword').value.trim();
            var device = document.getElementById('newDevice').value.trim();
            var err = document.getElementById('userAddError');
            err.style.display = 'none';
            if (!username || !password) { err.textContent = 'Username and password required!'; err.style.display = 'block'; return; }
            if (password.length < 4) { err.textContent = 'Password min 4 characters!'; err.style.display = 'block'; return; }
            for (var i = 0; i < users.length; i++) { if (users[i].username === username) { err.textContent = 'Username already exists!'; err.style.display = 'block'; return; } }
            var deviceLimit = parseInt(document.getElementById('newDeviceLimit').value) || 0;
            usersRef.push({
                username: username,
                password: password,
                device: device || '',
                deviceLimit: deviceLimit,
                canChangePassword: document.getElementById('newCanChangePass').checked,
                profileEdit: true,
                lockedDevices: [],
                created: Date.now()
            }).then(function() {
                document.getElementById('newUsername').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('newDevice').value = '';
                document.getElementById('newDeviceLimit').value = 1;
                document.getElementById('newCanChangePass').checked = false;
                showToast('User "' + username + '" added!');
            }).catch(function(e) { err.textContent = e.message; err.style.display = 'block'; });
        }

        function editUser(key) {
            for (var i = 0; i < users.length; i++) {
                if (users[i]._key === key) {
                    var user = users[i];
                    document.getElementById('editUserId').value = key;
                    document.getElementById('editUsername').value = user.username;
                    document.getElementById('editPassword').value = user.password;
                    document.getElementById('editDevice').value = user.device || '';
                    document.getElementById('editDeviceLimit').value = user.deviceLimit > 0 ? user.deviceLimit : 0;
                    document.getElementById('editCanChangePass').checked = !!user.canChangePassword;
                    document.getElementById('editProfileEdit').checked = user.profileEdit !== false;
                    document.getElementById('editUserError').style.display = 'none';
                    document.getElementById('editUserModal').classList.add('show');
                    return;
                }
            }
        }

        function saveEditUser() {
            var key = document.getElementById('editUserId').value;
            var username = document.getElementById('editUsername').value.trim();
            var password = document.getElementById('editPassword').value.trim();
            var device = document.getElementById('editDevice').value.trim();
            var deviceLimit = parseInt(document.getElementById('editDeviceLimit').value) || 0;
            var err = document.getElementById('editUserError');
            err.style.display = 'none';
            if (!username || !password) { err.textContent = 'Username and password required!'; err.style.display = 'block'; return; }
            if (password.length < 4) { err.textContent = 'Password min 4 chars!'; err.style.display = 'block'; return; }
            for (var i = 0; i < users.length; i++) {
                if (users[i]._key !== key && users[i].username === username) {
                    err.textContent = 'Username already exists!'; err.style.display = 'block'; return;
                }
            }
            usersRef.child(key).update({
                username: username,
                password: password,
                device: device || '',
                deviceLimit: deviceLimit,
                canChangePassword: document.getElementById('editCanChangePass').checked,
                profileEdit: document.getElementById('editProfileEdit').checked
            }).then(function() {
                document.getElementById('editUserModal').classList.remove('show');
                showToast('User updated!');
            }).catch(function(e) { err.textContent = e.message; err.style.display = 'block'; });
        }

        function deleteUser(key) {
            if (!confirm('Delete this user?')) return;
            usersRef.child(key).remove().then(function() {
                showToast('User deleted!');
            });
        }

        function resetDevice(key) {
            if (!confirm('Reset device lock for this user?')) return;
            usersRef.child(key).update({ lockedDevices: [] }).then(function() {
                showToast('Device reset!');
            });
        }

        var userDevicesShown = 50;
        var userDevicesSearch = '';

        function viewUserDevices(key, reset) {
            if (reset !== false) { userDevicesShown = 50; userDevicesSearch = ''; }
            var user = null;
            for (var i = 0; i < users.length; i++) { if (users[i]._key === key) { user = users[i]; break; } }
            var container = document.getElementById('userDevicesText');
            if (!user || !container) return;
            var devArr = user.lockedDevices || [];
            var sf = document.getElementById('userDevSearch');
            if (sf) userDevicesSearch = sf.value;
            var q = (userDevicesSearch || '').toLowerCase();
            if (devArr.length === 0) {
                container.innerHTML = '<div style="text-align:center;color:#555;padding:30px;"><i class="fas fa-mobile-alt" style="font-size:30px;opacity:0.4;display:block;margin-bottom:10px;"></i>Is account pe abhi tak koi login nahi hua.</div>';
                document.getElementById('userDevicesModal').classList.add('show');
                return;
            }
            var limit = user.deviceLimit;
            var html = '<div style="background:rgba(0,210,255,0.05);border:1px solid rgba(0,210,255,0.18);border-radius:12px;padding:12px 8px;margin-bottom:10px;display:flex;gap:6px;flex-wrap:wrap;text-align:center;">' +
                '<div style="flex:1;min-width:80px;"><div style="font-size:22px;font-weight:800;color:#00D2FF;">' + devArr.length + '</div><div style="font-size:9px;color:#AAA;letter-spacing:0.5px;">TOTAL LOGINS</div></div>' +
                '<div style="flex:1;min-width:80px;"><div style="font-size:22px;font-weight:800;color:#B366FF;">' + (limit > 0 ? limit : '&#8734;') + '</div><div style="font-size:9px;color:#AAA;letter-spacing:0.5px;">DEVICE LIMIT</div></div>' +
                '<div style="flex:1;min-width:80px;"><div style="font-size:22px;font-weight:800;color:' + (limit > 0 && devArr.length >= limit ? '#FF4C4C' : '#00E676') + ';">' + (limit > 0 ? Math.max(0, limit - devArr.length) : 'Unlimited') + '</div><div style="font-size:9px;color:#AAA;letter-spacing:0.5px;">' + (limit > 0 ? 'SLOTS LEFT' : 'PLAN') + '</div></div>' +
                '</div>';
            if (limit > 0) {
                var pct = Math.min(100, Math.round(devArr.length / limit * 100));
                html += '<div style="height:6px;background:rgba(255,255,255,0.08);border-radius:4px;overflow:hidden;margin-bottom:12px;"><div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,#00D2FF,#B366FF);transition:width .3s;"></div></div>';
            }
            var browsers = {};
            devArr.forEach(function(d) { var b = (typeof d === 'string') ? 'Unknown' : (d.browser || 'Unknown'); browsers[b] = (browsers[b] || 0) + 1; });
            var bKeys = Object.keys(browsers).sort(function(a, b) { return browsers[b] - browsers[a]; });
            if (bKeys.length) {
                html += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;">';
                bKeys.forEach(function(b) {
                    html += '<span style="background:rgba(179,102,255,0.1);border:1px solid rgba(179,102,255,0.25);color:#C792EA;font-size:10px;padding:4px 9px;border-radius:20px;"><i class="fas fa-globe"></i> ' + b + ' &middot; ' + browsers[b] + '</span>';
                });
                html += '</div>';
            }
            html += '<div style="position:relative;margin-bottom:12px;"><i class="fas fa-search" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#777;font-size:12px;"></i><input id="userDevSearch" value="' + escapeHtml(q) + '" placeholder="Search model, browser ya device ID..." oninput="reRenderUserDevices(\'' + key + '\')" style="width:100%;background:rgba(11,5,20,0.6);border:1px solid rgba(179,102,255,0.2);border-radius:8px;padding:10px 10px 10px 32px;color:#fff;font-size:12px;"></div>';
            var filtered = devArr.filter(function(d) {
                if (!q) return true;
                var dId = (typeof d === 'string') ? d : (d.id || '');
                var model = (typeof d === 'string') ? '' : (d.model || '');
                var browser = (typeof d === 'string') ? '' : (d.browser || '');
                return (dId + ' ' + model + ' ' + browser).toLowerCase().indexOf(q) !== -1;
            });
            var shown = filtered.slice(0, userDevicesShown);
            html += '<div style="font-size:10px;color:#888;margin-bottom:8px;">Showing <span style="color:#AAA;">' + shown.length + '</span> of <span style="color:#AAA;">' + filtered.length + '</span> device' + (filtered.length !== 1 ? 's' : '') + '</div>';
            if (filtered.length === 0) {
                html += '<div style="text-align:center;color:#777;padding:22px;"><i class="fas fa-search-minus" style="font-size:22px;opacity:0.5;display:block;margin-bottom:8px;"></i>Koi device match nahi hua.</div>';
            }
            shown.forEach(function(d, idx) {
                var dId = (typeof d === 'string') ? d : (d.id || '');
                var model = (typeof d === 'string') ? 'Unknown Device' : (d.model || 'Unknown');
                var browser = (typeof d === 'string') ? '' : (d.browser || '');
                var platform = (typeof d === 'string') ? '' : (d.platform || '');
                var first = (typeof d === 'string') ? '—' : (d.firstSeen ? new Date(d.firstSeen).toLocaleString('en-IN') : '—');
                var last = (typeof d === 'string') ? '—' : (d.lastSeen ? new Date(d.lastSeen).toLocaleString('en-IN') : '—');
                html += '<div style="background:rgba(11,5,20,0.55);border:1px solid rgba(179,102,255,0.12);border-left:3px solid #00D2FF;border-radius:10px;padding:10px 12px;margin-bottom:8px;">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">' +
                    '<div style="display:flex;align-items:center;gap:8px;min-width:0;flex:1;"><span style="background:rgba(0,210,255,0.12);color:#00D2FF;font-size:10px;padding:2px 7px;border-radius:6px;flex-shrink:0;">#' + (idx + 1) + '</span><b style="color:#C792EA;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px;"><i class="fas fa-mobile-alt" style="margin-right:5px;"></i>' + model + '</b></div>' +
                    '<button class="btn-sm" onclick="removeSingleDevice(\'' + key + '\',\'' + dId + '\')" style="background:rgba(255,76,76,0.15);color:#FF4C4C;border:none;border-radius:8px;padding:5px 10px;cursor:pointer;font-size:11px;flex-shrink:0;"><i class="fas fa-trash"></i> Remove</button></div>' +
                    (browser || platform ? '<div style="font-size:10px;color:#888;margin-top:5px;">' + (browser ? '<span><i class="fas fa-globe"></i> ' + browser + '</span>' : '') + (platform ? ' &middot; <span><i class="fas fa-laptop"></i> ' + platform + '</span>' : '') + '</div>' : '') +
                    '<div style="font-size:10px;color:#888;margin-top:3px;word-break:break-all;">ID: <span style="color:#666;font-family:monospace;">' + escapeHtml(dId) + '</span></div>' +
                    '<div style="font-size:10px;color:#888;margin-top:3px;">First Login: ' + first + '</div>' +
                    '<div style="font-size:10px;color:#AAA;">Last Login: ' + last + '</div></div>';
            });
            if (shown.length < filtered.length) {
                html += '<button class="btn" onclick="userDevicesShown += 50; reRenderUserDevices(\'' + key + '\')" style="width:100%;margin-top:8px;background:rgba(0,210,255,0.1);color:#00D2FF;border:1px solid rgba(0,210,255,0.3);"><i class="fas fa-plus"></i> LOAD MORE (' + (filtered.length - shown.length) + ' baki)</button>';
            }
            container.innerHTML = html;
            document.getElementById('userDevicesModal').classList.add('show');
        }

        function reRenderUserDevices(key) {
            viewUserDevices(key, false);
        }

        function removeSingleDevice(key, deviceId) {
            var user = null;
            for (var i = 0; i < users.length; i++) { if (users[i]._key === key) { user = users[i]; break; } }
            if (!user) return;
            var devArr = (user.lockedDevices || []).filter(function(d) {
                var dId = (typeof d === 'string') ? d : (d.id || '');
                return dId !== deviceId;
            });
            if (!confirm('Remove this device from account login?')) return;
            usersRef.child(key).update({ lockedDevices: devArr }).then(function() {
                showToast('Device removed!');
            });
        }

        function closeEditModal() { document.getElementById('editUserModal').classList.remove('show'); }
        function closeCodeModal() { document.getElementById('appCodeModal').classList.remove('show'); }
        function closeDevicesModal() { document.getElementById('appDevicesModal').classList.remove('show'); }
        function closeUserDevicesModal() { document.getElementById('userDevicesModal').classList.remove('show'); }

        // --- NOTIFICATIONS (ADMIN) ---
        var adminNotifListener = null;

        function renderNotifTargets() {
            var sel = document.getElementById('notifTarget');
            if (!sel) return;
            sel.innerHTML = '';
            var optAll = document.createElement('option');
            optAll.value = 'ALL';
            optAll.textContent = 'All Users (Global)';
            sel.appendChild(optAll);
            var sorted = users.slice().sort(function(a, b) { return (a.username || '').localeCompare(b.username || ''); });
            for (var i = 0; i < sorted.length; i++) {
                var opt = document.createElement('option');
                opt.value = sorted[i].username;
                opt.textContent = sorted[i].username;
                sel.appendChild(opt);
            }
        }

        function renderAdminNotifs() {
            renderNotifTargets();
            if (adminNotifListener) { db.ref('notifications').off('value', adminNotifListener); adminNotifListener = null; }
            var container = document.getElementById('notifListContainer');
            adminNotifListener = db.ref('notifications').orderByChild('time').on('value', function(snapshot) {
                var notifs = [];
                snapshot.forEach(function(child) { var n = child.val(); n._key = child.key; notifs.push(n); });
                notifs.reverse();
                document.getElementById('notifCount').textContent = '(' + notifs.length + ')';
                if (notifs.length === 0) { container.innerHTML = '<li style="text-align:center;color:#555;padding:30px;"><i class="fas fa-bell" style="margin-right:8px;"></i> No notifications sent yet.</li>'; return; }
                var html = '';
                notifs.forEach(function(n) {
                    var readCount = n.readBy ? Object.keys(n.readBy).length : 0;
                    var targetLabel = n.target === 'ALL'
                        ? '<span class="badge b-active">ALL USERS</span>'
                        : '<span class="badge" style="background:rgba(255,179,0,0.15);color:#FFB300;">USER: ' + esc(n.user) + '</span>';
                    html += '<li class="app-item" style="flex-direction:column;align-items:stretch;">' +
                        '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;"><h4>' + esc(n.text) + '</h4><div style="display:flex;gap:6px;align-items:center;">' + targetLabel +
                        '<button class="btn-sm" onclick="deleteNotification(\'' + n._key + '\')" style="background:rgba(255,76,76,0.15);color:#FF4C4C;border:none;border-radius:8px;padding:8px 12px;cursor:pointer;" title="Delete"><i class="fas fa-trash"></i></button>' +
                        '</div></div>' +
                        '<p style="font-size:11px;color:#888;margin-top:2px;"><i class="fas fa-crown" style="color:#B366FF;"></i> ADMIN &middot; ' + new Date(n.time || Date.now()).toLocaleString('en-IN') + ' &middot; Read by <b style="color:#00E676;">' + readCount + '</b> user(s)</p>' +
                        '</li>';
                });
                container.innerHTML = html;
            });
        }

        function sendNotification() {
            var text = document.getElementById('notifMsg').value.trim();
            var err = document.getElementById('notifSendError');
            if (!text) { err.textContent = 'Please enter a message!'; err.style.display = 'block'; return; }
            var target = document.getElementById('notifTarget').value;
            var isAll = (target === 'ALL');
            db.ref('notifications').push({
                text: text,
                time: Date.now(),
                from: 'ADMIN',
                target: isAll ? 'ALL' : 'user',
                user: isAll ? '' : target
            }).then(function() {
                err.style.display = 'none';
                document.getElementById('notifMsg').value = '';
                showToast('Notification sent!');
            }).catch(function() {
                err.textContent = 'Failed to send. Try again.'; err.style.display = 'block';
            });
        }

        function deleteNotification(key) {
            if (!confirm('Delete this notification?')) return;
            db.ref('notifications/' + key).remove().then(function() {
                showToast('Notification deleted!');
            });
        }

        function adminLogout() { localStorage.removeItem('adminSessionTime'); auth.signOut().then(function() { document.getElementById('loginOverlay').classList.remove('hidden'); }); }

        function showToast(msg) {
            var t = document.createElement('div');
            t.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:#00E676;color:#000;padding:14px 30px;border-radius:14px;font-weight:600;font-size:14px;box-shadow:0 15px 40px rgba(0,230,118,0.3);z-index:9999;font-family:Poppins,sans-serif;animation:fadeUp 0.3s ease;display:flex;align-items:center;gap:8px;';
            t.innerHTML = '<i class="fas fa-check-circle"></i> ' + msg;
            document.body.appendChild(t);
            setTimeout(function() { t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(20px)'; t.style.transition = '0.4s'; setTimeout(function() { document.body.removeChild(t); }, 500); }, 2500);
        }

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !document.getElementById('loginOverlay').classList.contains('hidden')) adminLogin();
        });

        document.addEventListener('click', function(e) {
            var nav = document.getElementById('mobileNav');
            var toggle = document.getElementById('mobileToggle');
            if (nav.classList.contains('show') && !nav.contains(e.target) && !toggle.contains(e.target)) {
                nav.classList.remove('show');
            }
        });
    