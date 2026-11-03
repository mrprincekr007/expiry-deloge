
        // DEFAULT PERMANENT LOGO LINK
        var DEFAULT_LOGO_LINK = "https://i.ibb.co/fY9dxvBP/6aa2bb3e9d2d.png";
        // DEFAULT TELEGRAM LINK FOR GENERATE PAGES
        var DEFAULT_TG_LINK = "https://t.me/+4hk87cVq1GUyMTNl";

        var onlineAppsArray = []; var offlineAppsArray = []; var currentOnFilter = 'All';
        var currentOnlineCode = ""; var currentOfflineCode = "";

        // ALL FORM IDS FOR AUTO-SAVE
        const formIds = [
            'on-appName', 'on-expiryDate', 'on-topTag', 'on-logoUrl', 'on-popTitle', 'on-subTitle', 'on-popMsg', 'on-wn1', 'on-wn2', 'on-wn3', 'on-btnText', 'on-btnAction', 'on-actionTxt', 'on-linkUrl',
            'off-appName', 'off-expiryDate', 'off-topTag', 'off-logoUrl', 'off-popTitle', 'off-subTitle', 'off-popMsg', 'off-wn1', 'off-wn2', 'off-wn3', 'off-btnText', 'off-btnAction', 'off-actionTxt', 'off-linkUrl',
            'onThemeSelect', 'onUiBg', 'onUiPrimary', 'onUiText', 'onUiDanger', 'onUiBorderW', 'onUiBorderC', 'onUiRadius', 'onUiBtnRadius', 'onUiDim', 'onUiBlur',
            'offThemeSelect', 'offUiBg', 'offUiPrimary', 'offUiText', 'offUiDanger', 'offUiBorderW', 'offUiBorderC', 'offUiRadius', 'offUiBtnRadius', 'offUiDim', 'offUiBlur'
        ];

        // 10 PREMIUM THEMES
        const themes = {
            '1': { bg: '#1c1c1e', pri: '#B366FF', txt: '#ffffff', dan: '#ff4c4c', rad: 60, brad: 30, dim: 0.25, blur: 25, bw: 0, bc: '#000000' },
            '2': { bg: '#0F172A', pri: '#38BDF8', txt: '#F1F5F9', dan: '#F87171', rad: 50, brad: 25, dim: 0.3, blur: 30, bw: 0, bc: '#000000' },
            '3': { bg: '#022C22', pri: '#34D399', txt: '#ECFDF5', dan: '#FB7185', rad: 35, brad: 18, dim: 0.4, blur: 20, bw: 1, bc: '#34D399' },
            '4': { bg: '#1E1147', pri: '#C084FC', txt: '#F5F3FF', dan: '#FACC15', rad: 60, brad: 30, dim: 0.35, blur: 40, bw: 2, bc: '#C084FC' },
            '5': { bg: '#2B0D0B', pri: '#FF8A65', txt: '#FFF3E0', dan: '#FF3D00', rad: 45, brad: 22, dim: 0.3, blur: 25, bw: 0, bc: '#000000' },
            '6': { bg: '#02101C', pri: '#22D3EE', txt: '#CFFAFE', dan: '#F43F5E', rad: 20, brad: 10, dim: 0.5, blur: 15, bw: 2, bc: '#22D3EE' },
            '7': { bg: '#171208', pri: '#EAB308', txt: '#FEF9C3', dan: '#EF4444', rad: 30, brad: 15, dim: 0.45, blur: 10, bw: 2, bc: '#EAB308' },
            '8': { bg: '#FFFFFF', pri: '#0A84FF', txt: '#1D1D1F', dan: '#FF3B30', rad: 40, brad: 20, dim: 0.15, blur: 35, bw: 1, bc: '#E5E5EA' },
            '9': { bg: '#04120B', pri: '#00FF41', txt: '#B8FFC8', dan: '#FF003C', rad: 0, brad: 0, dim: 0.6, blur: 5, bw: 2, bc: '#00FF41' },
            '10':{ bg: '#F4F1EA', pri: '#6C5CE7', txt: '#3D3D3D', dan: '#FF6B6B', rad: 60, brad: 30, dim: 0.1, blur: 40, bw: 0, bc: '#000000' }
        };

        // --- AUTO SAVE FUNCTIONS ---
        function getStorageKey(base) {
            var u = sessionStorage.getItem('panelLoggedUser');
            return u ? base + '_' + u : base;
        }

        function saveFormState() {
            let state = {};
            formIds.forEach(id => {
                let el = document.getElementById(id);
                if(el) { state[id] = id.includes('-actionTxt') ? el.innerText : el.value; }
            });
            localStorage.setItem(getStorageKey('delogeAdminStateV20'), JSON.stringify(state));
        }

        function loadFormState() {
            let stateStr = localStorage.getItem(getStorageKey('delogeAdminStateV20'));
            if(stateStr) {
                let state = JSON.parse(stateStr);
                formIds.forEach(id => {
                    let el = document.getElementById(id);
                    if(el && state[id] !== undefined) {
                        if(id.includes('-actionTxt')) el.innerText = state[id];
                        else el.value = state[id];
                    }
                });
                ['on', 'off'].forEach(pre => {
                    let link = document.getElementById(pre+'-linkUrl');
                    if(link && !link.value) link.value = DEFAULT_TG_LINK;
                    updateCloseBtnVisibility(pre);
                    let themeVal = document.getElementById(pre+'ThemeSelect');
                    let themeTxt = document.getElementById(pre+'-themeTxt');
                    if(themeVal && themeVal.value) {
                        let opt = document.querySelector('#' + pre + '-themeDropdown .select-option[data-value="' + themeVal.value + '"]');
                        if(opt && themeTxt) themeTxt.innerText = opt.innerText;
                    }
                });
                applyOnUI();
                applyOffUI();
            }
        }

        function applyThemePreset(system, themeId) {
            let t = themes[themeId];
            if(t) {
                document.getElementById(system+'UiBg').value = t.bg; document.getElementById(system+'UiPrimary').value = t.pri; document.getElementById(system+'UiText').value = t.txt; document.getElementById(system+'UiDanger').value = t.dan; document.getElementById(system+'UiRadius').value = t.rad; document.getElementById(system+'UiBtnRadius').value = t.brad; document.getElementById(system+'UiDim').value = t.dim; document.getElementById(system+'UiBlur').value = t.blur; document.getElementById(system+'UiBorderW').value = t.bw; document.getElementById(system+'UiBorderC').value = t.bc;
                if(system === 'on') applyOnUI(); else applyOffUI();
                saveFormState();
                showToast("Theme Applied!");
            }
        }

        function showFullScreenPreview(type) {
            let clone = document.getElementById('pv-' + type + '-wrapper').innerHTML;
            document.getElementById('fullPreviewBox').innerHTML = clone;
            
            let bg = document.getElementById(type + 'UiBg').value; let rad = document.getElementById(type + 'UiRadius').value; let bw = document.getElementById(type + 'UiBorderW').value; let bc = document.getElementById(type + 'UiBorderC').value; let dim = document.getElementById(type + 'UiDim').value; let blur = document.getElementById(type + 'UiBlur').value;

            let box = document.getElementById('fullPreviewBox');
            box.style.background = bg; box.style.borderRadius = (rad * 0.4) + 'px'; box.style.border = bw > 0 ? (bw + 'px solid ' + bc) : 'none';

            let modal = document.getElementById('fullPreviewModal');
            modal.style.background = `rgba(0,0,0,${dim})`; modal.style.backdropFilter = `blur(${blur}px)`; modal.classList.add('show');
        }

        function toggleMenu() { document.getElementById('sidebar').classList.toggle('active'); document.getElementById('overlay').classList.toggle('active'); }
        function closeMenu() { document.getElementById('sidebar').classList.remove('active'); document.getElementById('overlay').classList.remove('active'); }
        function switchPage(pageId, el) { 
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active')); document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active')); document.getElementById('page-' + pageId).classList.add('active'); 
            if (el) { el.classList.add('active'); } else { var cur = document.querySelector('.menu-item[data-page="' + pageId + '"]'); if (cur) cur.classList.add('active'); }
            let tMap = {'dashboard':'Dashboard', 'gen-on':'Generate Online', 'man-on':'Manage Online', 'ui-on':'Online UI', 'gen-off':'Generate Offline', 'man-off':'Offline History', 'ui-off':'Offline UI', 'support':'Support', 'settings':'Settings'};
            document.getElementById('pageTitle').innerText = tMap[pageId].toUpperCase(); 
            if(window.innerWidth <= 768) toggleMenu(); 
        }
        function toggleDropdown(id) {
            var el = document.getElementById(id).parentElement;
            document.querySelectorAll('.custom-select').forEach(sel => { if(sel !== el) sel.classList.remove('active'); });
            var drop = document.getElementById(id);
            if (el.classList.contains('active')) { el.classList.remove('active'); return; }
            var rect = el.getBoundingClientRect();
            var dropH = drop.offsetHeight || 160;
            var spaceBelow = window.innerHeight - rect.bottom;
            if (spaceBelow < dropH) {
                drop.style.top = 'auto';
                drop.style.bottom = 'calc(100% + 6px)';
            } else {
                drop.style.top = 'calc(100% + 6px)';
                drop.style.bottom = 'auto';
            }
            drop.style.left = '0';
            drop.style.minWidth = Math.max(rect.width, 140) + 'px';
            el.classList.add('active');
        }
        document.addEventListener('click', function(e) { if(!e.target.closest('.custom-select')) { document.querySelectorAll('.custom-select').forEach(el => el.classList.remove('active')); }});
        document.addEventListener('scroll', function(e) { if(e.target && e.target.closest && e.target.closest('.select-dropdown')) return; document.querySelectorAll('.custom-select').forEach(el => el.classList.remove('active')); }, true);
        
        function selectAction(val, text, pre) { 
            document.getElementById(pre+'-actionTxt').innerText = text; document.getElementById(pre+'-btnAction').value = val; document.getElementById(pre+'-actionDropdown').parentElement.classList.remove('active'); 
            updateCloseBtnVisibility(pre);
            saveFormState();
        }

        function updateCloseBtnVisibility(pre) {
            var action = document.getElementById(pre+'-btnAction').value;
            var wrapper = document.getElementById('pv-' + pre + '-wrapper');
            if(!wrapper) return;
            var closeBtn = wrapper.querySelector('.pv-close-btn');
            if(closeBtn) closeBtn.style.display = (action === 'exit') ? 'flex' : 'none';
        }

        function selectTheme(system, val, text) {
            document.getElementById(system+'ThemeSelect').value = val;
            document.getElementById(system+'-themeTxt').innerText = text;
            document.getElementById(system+'-themeDropdown').parentElement.classList.remove('active');
            applyThemePreset(system, val);
        }
        
        function showToast(msg, isError = false) { var box = document.getElementById('toastBox'); document.getElementById('toastMsg').innerText = msg; box.style.background = isError ? 'var(--danger)' : 'var(--success)'; box.style.color = isError ? 'white' : 'black'; box.classList.add('show'); setTimeout(() => box.classList.remove('show'), 3000); }
        function copyTextToClipboard(text) { if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).then(() => showToast("Copied!")); } else { var ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); showToast("Copied!"); } }
        
        function copyInlineCode(pre) { if(pre === 'on') { copyTextToClipboard(currentOnlineCode); } else { copyTextToClipboard(currentOfflineCode); } }
        function copyFromModal() { copyTextToClipboard(document.getElementById('modalCodeDisplay').textContent); }
        function closeModal(id) { document.getElementById(id).classList.remove('show'); }
        
        function escapeJava(str) { return str ? str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r?\n/g, '" + "\\n" + "') : ""; }
        function adjustColor(color, amount) { return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2)); }

        function applyOnUI() {
            let bg = document.getElementById('onUiBg').value; let primary = document.getElementById('onUiPrimary').value; let text = document.getElementById('onUiText').value; let danger = document.getElementById('onUiDanger').value;
            let bw = document.getElementById('onUiBorderW').value; let bc = document.getElementById('onUiBorderC').value; let rad = document.getElementById('onUiRadius').value; let btnRad = document.getElementById('onUiBtnRadius').value;
            let wrap = document.getElementById('pv-on-wrapper');
            wrap.style.background = bg; wrap.style.borderRadius = (rad * 0.4) + 'px'; wrap.style.border = bw > 0 ? (bw + 'px solid ' + bc) : 'none';
            document.getElementById('pv-on-title').style.color = text; document.getElementById('pv-on-subtitle').style.color = primary; document.getElementById('pv-on-wntitle').style.color = primary; 
            let btn = document.getElementById('pv-on-btn'); btn.style.background = primary; btn.style.color = (bg==='#FFFFFF'||bg==='#F4F1EA') ? '#FFFFFF' : text; btn.style.borderRadius = (btnRad * 0.4) + 'px';
            document.getElementById('pv-on-tag').style.color = danger; document.getElementById('pv-on-tag').style.borderColor = danger; 
            document.getElementById('pv-on-box').style.background = adjustColor(bg, (bg==='#FFFFFF'||bg==='#F4F1EA')?-10:10); document.getElementById('pv-on-box').style.borderColor = adjustColor(bg, 20);
            updateOnPreview();
        }

        function applyOffUI() {
            let bg = document.getElementById('offUiBg').value; let primary = document.getElementById('offUiPrimary').value; let text = document.getElementById('offUiText').value; let danger = document.getElementById('offUiDanger').value;
            let bw = document.getElementById('offUiBorderW').value; let bc = document.getElementById('offUiBorderC').value; let rad = document.getElementById('offUiRadius').value; let btnRad = document.getElementById('offUiBtnRadius').value;
            let wrap = document.getElementById('pv-off-wrapper');
            wrap.style.background = bg; wrap.style.borderRadius = (rad * 0.4) + 'px'; wrap.style.border = bw > 0 ? (bw + 'px solid ' + bc) : 'none';
            document.getElementById('pv-off-title').style.color = text; document.getElementById('pv-off-subtitle').style.color = primary; document.getElementById('pv-off-wntitle').style.color = primary; 
            let btn = document.getElementById('pv-off-btn'); btn.style.background = primary; btn.style.color = (bg==='#FFFFFF'||bg==='#F4F1EA') ? '#FFFFFF' : text; btn.style.borderRadius = (btnRad * 0.4) + 'px';
            document.getElementById('pv-off-tag').style.color = danger; document.getElementById('pv-off-tag').style.borderColor = danger; 
            document.getElementById('pv-off-box').style.background = adjustColor(bg, (bg==='#FFFFFF'||bg==='#F4F1EA')?-10:10);
            updateOffPreview();
        }

        function updateOnPreview() {
            document.getElementById('pv-on-tag').innerText = document.getElementById('on-topTag').value || " "; 
            document.getElementById('pv-on-logo').src = document.getElementById('on-logoUrl').value || DEFAULT_LOGO_LINK; 
            document.getElementById('pv-on-title').innerText = document.getElementById('on-popTitle').value || " "; document.getElementById('pv-on-subtitle').innerText = document.getElementById('on-subTitle').value || " "; document.getElementById('pv-on-body').innerText = document.getElementById('on-popMsg').value || " ";
            ['1','2','3'].forEach(i => { let val = document.getElementById('on-wn'+i).value.trim(); document.getElementById('pv-on-wn'+i).style.display = val ? "flex" : "none"; document.getElementById('pv-on-wn'+i).innerText = val; document.getElementById('pv-on-wn'+i).style.color = document.getElementById('onUiText').value;});
            document.getElementById('pv-on-btn').innerText = document.getElementById('on-btnText').value || " "; document.getElementById('pv-on-body').style.color = document.getElementById('onUiText').value;
        }

        function updateOffPreview() {
            document.getElementById('pv-off-tag').innerText = document.getElementById('off-topTag').value || " "; 
            document.getElementById('pv-off-logo').src = document.getElementById('off-logoUrl').value || DEFAULT_LOGO_LINK;
            document.getElementById('pv-off-title').innerText = document.getElementById('off-popTitle').value || " "; document.getElementById('pv-off-subtitle').innerText = document.getElementById('off-subTitle').value || " "; document.getElementById('pv-off-body').innerText = document.getElementById('off-popMsg').value || " ";
            ['1','2','3'].forEach(i => { let val = document.getElementById('off-wn'+i).value.trim(); document.getElementById('pv-off-wn'+i).style.display = val ? "flex" : "none"; document.getElementById('pv-off-wn'+i).innerText = val; document.getElementById('pv-off-wn'+i).style.color = document.getElementById('offUiText').value; });
            document.getElementById('pv-off-btn').innerText = document.getElementById('off-btnText').value || " "; document.getElementById('pv-off-body').style.color = document.getElementById('offUiText').value;
        }

        // --- JAVA CODE TEMPLATE ENGINE (EXACT MATCH WITH SNIPPET 2) ---
        function getJavaString(isOnline, appName, newCode, expTimeMillis, uBg, uPri, uTxt, uDan, uRad, uBtnRad, uDim, uBlur, uBw, uBc, tag, logo, title, sub, msg, w1, w2, w3, btnTxt, clickAction, showCloseBtn) {
            var strokeCode = uBw > 0 ? `bgShape.setStroke(${uBw}, android.graphics.Color.parseColor("${uBc}"));` : ``;
            var finalLogoUrl = logo ? logo : DEFAULT_LOGO_LINK;

            var closeBtnCode = showCloseBtn ? `    android.widget.TextView closeBtn = new android.widget.TextView(MainActivity.this);
    closeBtn.setText("\u2715");
    closeBtn.setTextColor(android.graphics.Color.parseColor("${uTxt}"));
    closeBtn.setTextSize(16);
    closeBtn.setGravity(android.view.Gravity.CENTER);
    closeBtn.setClickable(true);
    android.widget.LinearLayout.LayoutParams closeParams = new android.widget.LinearLayout.LayoutParams(70, 70);
    closeParams.leftMargin = 20;
    closeBtn.setLayoutParams(closeParams);
    android.graphics.drawable.GradientDrawable closeShape = new android.graphics.drawable.GradientDrawable();
    closeShape.setColor(android.graphics.Color.parseColor("#22FFFFFF"));
    closeShape.setCornerRadius(35f);
    closeBtn.setBackground(closeShape);
    closeBtn.setOnClickListener(new android.view.View.OnClickListener() { @Override public void onClick(android.view.View v) { dialog.dismiss(); } });
    btnRow.addView(closeBtn);
` : ``;

            var coreCode = `    final android.app.Dialog dialog = new android.app.Dialog(MainActivity.this);
    dialog.requestWindowFeature(android.view.Window.FEATURE_NO_TITLE);
    dialog.setCancelable(false);
    dialog.getWindow().setBackgroundDrawable(new android.graphics.drawable.ColorDrawable(android.graphics.Color.TRANSPARENT));
    dialog.getWindow().getAttributes().windowAnimations = android.R.style.Animation_Dialog;
    android.widget.LinearLayout mainLayout = new android.widget.LinearLayout(MainActivity.this);
    mainLayout.setOrientation(android.widget.LinearLayout.VERTICAL);
    android.graphics.drawable.GradientDrawable bgShape = new android.graphics.drawable.GradientDrawable();
    bgShape.setColor(android.graphics.Color.parseColor("${uBg}"));
    bgShape.setCornerRadius(${uRad}f);
    ${strokeCode}
    mainLayout.setBackground(bgShape);
    mainLayout.setPadding(60, 60, 60, 60);
    mainLayout.setClipChildren(false);
    mainLayout.setClipToPadding(false);
    android.widget.TextView topTag = new android.widget.TextView(MainActivity.this);
    topTag.setText("${tag}");
    topTag.setTextColor(android.graphics.Color.parseColor("${uDan}"));
    topTag.setTextSize(12);
    topTag.setPadding(35, 12, 35, 12);
    android.graphics.drawable.GradientDrawable tagShape = new android.graphics.drawable.GradientDrawable();
    tagShape.setStroke(2, android.graphics.Color.parseColor("${uDan}"));
    tagShape.setColor(android.graphics.Color.parseColor("#1A" + "${uDan}".replace("#","")));
    tagShape.setCornerRadius(40f);
    topTag.setBackground(tagShape);
    android.widget.LinearLayout.LayoutParams tagParams = new android.widget.LinearLayout.LayoutParams(android.view.ViewGroup.LayoutParams.WRAP_CONTENT, android.view.ViewGroup.LayoutParams.WRAP_CONTENT);
    tagParams.gravity = android.view.Gravity.CENTER_HORIZONTAL;
    tagParams.topMargin = 15;
    tagParams.bottomMargin = 35;
    mainLayout.addView(topTag, tagParams);
    android.widget.LinearLayout headerLayout = new android.widget.LinearLayout(MainActivity.this);
    headerLayout.setOrientation(android.widget.LinearLayout.HORIZONTAL);
    headerLayout.setGravity(android.view.Gravity.CENTER_VERTICAL);
    final android.widget.ImageView logoImg = new android.widget.ImageView(MainActivity.this);
    android.widget.LinearLayout.LayoutParams imgParams = new android.widget.LinearLayout.LayoutParams(130, 130);
    imgParams.rightMargin = 30;
    logoImg.setLayoutParams(imgParams);
    headerLayout.addView(logoImg);
    new Thread(new Runnable() { public void run() { try { java.net.URL imgUrl = new java.net.URL("${finalLogoUrl}"); final android.graphics.Bitmap bmp = android.graphics.BitmapFactory.decodeStream(imgUrl.openConnection().getInputStream()); runOnUiThread(new Runnable() { public void run() { logoImg.setImageBitmap(bmp); } }); } catch (Exception e) {} } }).start();
    android.widget.LinearLayout titleLayout = new android.widget.LinearLayout(MainActivity.this);
    titleLayout.setOrientation(android.widget.LinearLayout.VERTICAL);
    android.widget.TextView mainTitle = new android.widget.TextView(MainActivity.this);
    mainTitle.setText("${title}");
    mainTitle.setTextColor(android.graphics.Color.parseColor("${uTxt}"));
    mainTitle.setTextSize(17);
    mainTitle.setTypeface(null, android.graphics.Typeface.BOLD);
    android.widget.TextView subTitle = new android.widget.TextView(MainActivity.this);
    subTitle.setText("${sub}");
    subTitle.setTextColor(android.graphics.Color.parseColor("${uPri}"));
    subTitle.setTextSize(13);
    subTitle.setTypeface(null, android.graphics.Typeface.BOLD);
    titleLayout.addView(mainTitle);
    titleLayout.addView(subTitle);
    headerLayout.addView(titleLayout);
    mainLayout.addView(headerLayout);
    android.widget.Space sp1 = new android.widget.Space(MainActivity.this);
    sp1.setLayoutParams(new android.widget.LinearLayout.LayoutParams(1, 40));
    mainLayout.addView(sp1);
    android.widget.TextView bodyText = new android.widget.TextView(MainActivity.this);
    bodyText.setText("${msg}");
    bodyText.setTextColor(android.graphics.Color.parseColor("${uTxt}"));
    bodyText.setTextSize(14);
    mainLayout.addView(bodyText);
    android.widget.Space sp2 = new android.widget.Space(MainActivity.this);
    sp2.setLayoutParams(new android.widget.LinearLayout.LayoutParams(1, 40));
    mainLayout.addView(sp2);
    android.widget.LinearLayout whatsNewBox = new android.widget.LinearLayout(MainActivity.this);
    whatsNewBox.setOrientation(android.widget.LinearLayout.VERTICAL);
    android.graphics.drawable.GradientDrawable wnShape = new android.graphics.drawable.GradientDrawable();
    wnShape.setColor(android.graphics.Color.parseColor("#15FFFFFF"));
    wnShape.setCornerRadius(30f);
    whatsNewBox.setBackground(wnShape);
    whatsNewBox.setPadding(40, 40, 40, 40);
    android.widget.TextView wnTitle = new android.widget.TextView(MainActivity.this);
    wnTitle.setText("What\\'s New");
    wnTitle.setTextColor(android.graphics.Color.parseColor("${uPri}"));
    wnTitle.setTextSize(13);
    wnTitle.setTypeface(null, android.graphics.Typeface.BOLD);
    whatsNewBox.addView(wnTitle);
    String[] bullets = {"${w1}", "${w2}", "${w3}"};
    for(String b : bullets) {
        if(b.trim().length() > 0) {
            android.widget.TextView bullet = new android.widget.TextView(MainActivity.this);
            bullet.setText(b);
            bullet.setTextColor(android.graphics.Color.parseColor("${uTxt}"));
            bullet.setTextSize(14);
            bullet.setPadding(0, 15, 0, 0);
            whatsNewBox.addView(bullet);
        }
    }
    mainLayout.addView(whatsNewBox);
    android.widget.Space sp3 = new android.widget.Space(MainActivity.this);
    sp3.setLayoutParams(new android.widget.LinearLayout.LayoutParams(1, 40));
    mainLayout.addView(sp3);
    android.widget.LinearLayout btnRow = new android.widget.LinearLayout(MainActivity.this);
    btnRow.setOrientation(android.widget.LinearLayout.HORIZONTAL);
    btnRow.setGravity(android.view.Gravity.CENTER_VERTICAL);
    android.widget.Button actionBtn = new android.widget.Button(MainActivity.this);
    actionBtn.setText("${btnTxt}");
    actionBtn.setTextColor(android.graphics.Color.parseColor("${(uBg==='#FFFFFF'||uBg==='#F4F1EA') ? '#FFFFFF' : uTxt}"));
    actionBtn.setTextSize(15);
    actionBtn.setTypeface(null, android.graphics.Typeface.BOLD);
    actionBtn.setLayoutParams(new android.widget.LinearLayout.LayoutParams(0, android.view.ViewGroup.LayoutParams.WRAP_CONTENT, 1f));
    android.graphics.drawable.GradientDrawable btnShape = new android.graphics.drawable.GradientDrawable();
    btnShape.setColor(android.graphics.Color.parseColor("${uPri}"));
    btnShape.setCornerRadius(${uBtnRad}f);
    actionBtn.setBackground(btnShape);
    actionBtn.setOnClickListener(new android.view.View.OnClickListener() { @Override public void onClick(android.view.View v) { ${clickAction} } });
    btnRow.addView(actionBtn);
    ${closeBtnCode}
    mainLayout.addView(btnRow);
    dialog.setContentView(mainLayout);
    android.view.Window window = dialog.getWindow();
    if (window != null) {
        window.setLayout((int)(getResources().getDisplayMetrics().widthPixels * 0.90), android.view.ViewGroup.LayoutParams.WRAP_CONTENT);
        window.addFlags(android.view.WindowManager.LayoutParams.FLAG_DIM_BEHIND);
        window.setDimAmount(${uDim}f);
        if (android.os.Build.VERSION.SDK_INT >= 31) {
            window.addFlags(android.view.WindowManager.LayoutParams.FLAG_BLUR_BEHIND);
            window.getAttributes().setBlurBehindRadius(${uBlur});
        }
    }
    dialog.show();
    android.animation.ObjectAnimator animX = android.animation.ObjectAnimator.ofFloat(topTag, "scaleX", 1.0f, 1.08f);
    android.animation.ObjectAnimator animY = android.animation.ObjectAnimator.ofFloat(topTag, "scaleY", 1.0f, 1.08f);
    animX.setRepeatCount(android.animation.ValueAnimator.INFINITE);
    animX.setRepeatMode(android.animation.ValueAnimator.REVERSE);
    animX.setDuration(600);
    animY.setRepeatCount(android.animation.ValueAnimator.INFINITE);
    animY.setRepeatMode(android.animation.ValueAnimator.REVERSE);
    animY.setDuration(600);
    android.animation.AnimatorSet animSet = new android.animation.AnimatorSet();
    animSet.playTogether(animX, animY);
    animSet.start();`;

            if(isOnline) {
                return `// ONLINE APP: ${appName} | CODE: ${newCode}\nfinal String appCode = "${newCode}";\nfinal String dbUrl = "https://prince-hacks-website-default-rtdb.firebaseio.com/app_control/apps/" + appCode + ".json";\nfinal String _devId = android.provider.Settings.Secure.getString(getContentResolver(), android.provider.Settings.Secure.ANDROID_ID);\nfinal boolean[] _devReg = {false};\nnew Thread(new Runnable() { @Override public void run() { while(!isFinishing()) { try { java.net.URL url = new java.net.URL(dbUrl); java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection(); conn.setRequestMethod("GET"); conn.setConnectTimeout(5000); java.io.BufferedReader in = new java.io.BufferedReader(new java.io.InputStreamReader(conn.getInputStream())); String inputLine; StringBuilder response = new StringBuilder(); while ((inputLine = in.readLine()) != null) { response.append(inputLine); } in.close(); org.json.JSONObject json = new org.json.JSONObject(response.toString()); String status = json.optString("status", "Active"); long expTime = json.optLong("expiryTime", 0); boolean isExpired = "Expired".equals(status); if (!isExpired && expTime > 0 && System.currentTimeMillis() > expTime) { isExpired = true; } if (isExpired) { runOnUiThread(new Runnable() { @Override public void run() { if (!isFinishing()) {\n${coreCode}\n} } }); break; } if (!isExpired && !_devReg[0]) { try { String _devUrl = "https://prince-hacks-website-default-rtdb.firebaseio.com/app_control/apps/" + appCode + "/devices/" + _devId + ".json"; java.net.HttpURLConnection _dConn = (java.net.HttpURLConnection) new java.net.URL(_devUrl).openConnection(); _dConn.setRequestMethod("PUT"); _dConn.setRequestProperty("Content-Type", "application/json"); _dConn.setDoOutput(true); org.json.JSONObject _dObj = new org.json.JSONObject(); _dObj.put("model", android.os.Build.MANUFACTURER + " " + android.os.Build.MODEL); _dObj.put("firstSeen", System.currentTimeMillis()); _dObj.put("lastSeen", System.currentTimeMillis()); java.io.OutputStream _os = _dConn.getOutputStream(); _os.write(_dObj.toString().getBytes()); _os.close(); _dConn.getResponseCode(); _dConn.disconnect(); _devReg[0] = true; } catch (Exception _ex) {} } Thread.sleep(3000); } catch (Exception e) { try { Thread.sleep(3000); } catch (Exception ex) {} } } } }).start();`;
            } else {
                return `// OFFLINE AUTO-EXPIRE CODE: ${appName}\nlong expiryTime = ${expTimeMillis}L;\nif (System.currentTimeMillis() >= expiryTime) {\n${coreCode}\n}`;
            }
        }

        // --- ONLINE GENERATOR ---
        function generateOnlineCode() {
            var appName = document.getElementById('on-appName').value.trim(); if(!appName) return showToast("Enter App Name!", true);
            var expTimeMillis = document.getElementById('on-expiryDate').value ? new Date(document.getElementById('on-expiryDate').value).getTime() : 0;
            var newCode = "PRINCE-" + Math.floor(100000 + Math.random() * 900000);
            
            var uBg = document.getElementById('onUiBg').value; var uPri = document.getElementById('onUiPrimary').value; var uTxt = document.getElementById('onUiText').value; var uDan = document.getElementById('onUiDanger').value; var uRad = document.getElementById('onUiRadius').value || "60"; var uBtnRad = document.getElementById('onUiBtnRadius').value || "30"; var uDim = document.getElementById('onUiDim').value || "0.25"; var uBlur = document.getElementById('onUiBlur').value || "25"; var uBw = document.getElementById('onUiBorderW').value || "0"; var uBc = document.getElementById('onUiBorderC').value || "#000000";
            var tag = escapeJava(document.getElementById("on-topTag").value); var logo = document.getElementById("on-logoUrl").value; var title = escapeJava(document.getElementById("on-popTitle").value); var sub = escapeJava(document.getElementById("on-subTitle").value); var msg = escapeJava(document.getElementById("on-popMsg").value); var w1 = escapeJava(document.getElementById("on-wn1").value); var w2 = escapeJava(document.getElementById("on-wn2").value); var w3 = escapeJava(document.getElementById("on-wn3").value); var btnTxt = escapeJava(document.getElementById("on-btnText").value);
            var action = document.getElementById("on-btnAction").value; var url = document.getElementById("on-linkUrl").value;
            var javaActionCode = action === "link" ? `android.content.Intent intent = new android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse("${url}")); startActivity(intent); finishAffinity();` : `finishAffinity();`;

            var javaCode = getJavaString(true, appName, newCode, expTimeMillis, uBg, uPri, uTxt, uDan, uRad, uBtnRad, uDim, uBlur, uBw, uBc, tag, logo, title, sub, msg, w1, w2, w3, btnTxt, javaActionCode, action === "exit");

            currentOnlineCode = javaCode;
            var loggedUser = sessionStorage.getItem('panelLoggedUser') || '';

            db.ref('app_control/apps/' + newCode).set({ name: appName, status: "Active", date: new Date().toLocaleDateString("en-GB"), timestamp: Date.now(), expiryTime: expTimeMillis, javacode: javaCode, owner: loggedUser }).then(() => {
                document.getElementById('on-outputBox').style.display = "block"; document.getElementById('on-appName').value = ""; showToast("Online Code Ready!");
            });
        }

        // --- FETCH AND CHECK ONLINE EXPIRY LIVE ---
        db.ref('app_control/apps').on('value', (snapshot) => {
            onlineAppsArray = []; var userTotal = 0, userActive = 0, userExpired = 0; let now = Date.now();
            var loggedUser = sessionStorage.getItem('panelLoggedUser') || '';
            snapshot.forEach((child) => { 
                var data = child.val(); data.code = child.key; onlineAppsArray.push(data);
                if (data.owner && data.owner !== loggedUser) { return; }
                userTotal++;
                let isTimeExpired = (data.expiryTime > 0 && now > data.expiryTime);
                if(data.status === "Expired" || isTimeExpired) { userExpired++; } else { userActive++; }
            });
            document.getElementById('stat-on-total').innerText = userTotal; document.getElementById('stat-on-active').innerText = userActive; document.getElementById('stat-on-expired').innerText = userExpired;
            onlineAppsArray.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)); renderOnList();
        });

        function setOnFilter(status, btnElement) { currentOnFilter = status; document.querySelectorAll('#page-man-on .filter-btn').forEach(btn => btn.classList.remove('active')); btnElement.classList.add('active'); renderOnList(); }
        
        function renderOnList() {
            var listContainer = document.getElementById('on-appListContainer'); var searchQuery = document.getElementById('on-searchInput').value.toLowerCase(); listContainer.innerHTML = '';
            let now = Date.now();
            var loggedUser = sessionStorage.getItem('panelLoggedUser') || '';
            var filteredData = onlineAppsArray.filter(app => { 
                let isTimeExpired = (app.expiryTime > 0 && now > app.expiryTime);
                let displayStatus = (app.status === "Expired" || isTimeExpired) ? "Expired" : "Active";
                let matchesSearch = ((app.name && app.name.toLowerCase().includes(searchQuery)) || (app.code || '').toLowerCase().includes(searchQuery));
                let matchesFilter = (currentOnFilter === 'All') || (displayStatus === currentOnFilter);
                let matchesOwner = !app.owner || app.owner === loggedUser;
                return matchesSearch && matchesFilter && matchesOwner; 
            });
            
            if(filteredData.length === 0) return listContainer.innerHTML = '<li style="text-align: center; color: #555; padding: 20px;">No apps found.</li>';
            filteredData.forEach(app => {
                let isTimeExpired = (app.expiryTime > 0 && now > app.expiryTime);
                let displayStatus = (app.status === "Expired" || isTimeExpired) ? "Expired" : "Active";
                var badgeClass = displayStatus === "Active" ? "b-active" : "b-expired"; 
                var expText = app.expiryTime && app.expiryTime > 0 ? new Date(app.expiryTime).toLocaleString('en-IN') : "No Limit";
                var li = document.createElement('li'); li.className = "app-item";
                var isActive = displayStatus === "Active";
                li.innerHTML = `
                    <div class="app-info"><h4>${app.name} <span class="badge ${badgeClass}">${displayStatus}</span></h4><p>${app.code} &nbsp;|&nbsp; ⏱️ Expiry: ${expText}</p></div>
                    <div class="app-controls">
                        <button class="btn-small ${isActive?'btn-active':'btn-inactive'}" onclick="setOnStatus('${app.code}', 'Active')">Active</button>
                        <button class="btn-small ${!isActive?'btn-expired':'btn-inactive'}" onclick="setOnStatus('${app.code}', 'Expired')">Expired</button>
                        <button class="btn-small btn-edit" onclick="openOnEditModal('${app.code}')"><i class="fas fa-pen"></i></button>
                        <button class="btn-small btn-view" onclick="openCodeModal('${app.code}', 'on')"><i class="fas fa-code"></i></button>
                        <button class="btn-small btn-delete" onclick="deleteOnApp('${app.code}')"><i class="fas fa-trash"></i></button>
                    </div>`;
                listContainer.appendChild(li);
            });
        }

        function setOnStatus(code, status) {
            db.ref('app_control/apps/' + code).update({ status: status }).then(() => { showToast("Status updated"); renderOnList(); });
        }
        function deleteOnApp(code) { if(confirm("Delete app?")) { db.ref('app_control/apps/' + code).remove().then(() => showToast("Deleted successfully!")); } }
        function clearOnExpired() {
            var now = Date.now(); var loggedUser = sessionStorage.getItem('panelLoggedUser') || '';
            var expiredList = onlineAppsArray.filter(app => {
                let isTimeExpired = (app.expiryTime > 0 && now > app.expiryTime);
                let isExpired = (app.status === "Expired" || isTimeExpired);
                let owns = !app.owner || app.owner === loggedUser;
                return isExpired && owns;
            });
            if(expiredList.length === 0) return showToast("No expired apps to clear!", true);
            if(!confirm("Clear " + expiredList.length + " expired app(s)?")) return;
            var promises = expiredList.map(app => db.ref('app_control/apps/' + app.code).remove());
            Promise.all(promises).then(() => { showToast(expiredList.length + " expired app(s) cleared!"); renderOnList(); }).catch(() => showToast("Error clearing apps!", true));
        }
        function openCodeModal(code, type) { 
            var app = (type==='on') ? onlineAppsArray.find(a => a.code === code) : offlineAppsArray.find(a => a.id === code);
            if(app && (app.javacode || app.code)) { 
                document.getElementById('modalCodeTitle').innerText = type==='on' ? "Online Java Code" : "Offline Java Code";
                document.getElementById('modalCodeDisplay').textContent = app.javacode || app.code; 
                document.getElementById('codeModal').classList.add('show'); 
            } else { showToast("Code not found!", true); }
        }
        function openOnEditModal(code) { var app = onlineAppsArray.find(a => a.code === code); if(app) { document.getElementById('editAppCode').value = code; document.getElementById('editAppName').value = app.name; if (app.expiryTime && app.expiryTime > 0) { var tzoffset = (new Date()).getTimezoneOffset() * 60000; document.getElementById('editExpiryDate').value = (new Date(app.expiryTime - tzoffset)).toISOString().slice(0, 16); } else { document.getElementById('editExpiryDate').value = ""; } document.getElementById('editModal').classList.add('show'); } }
        function saveAppEdits() { var code = document.getElementById('editAppCode').value; var newName = document.getElementById('editAppName').value; var newExpRaw = document.getElementById('editExpiryDate').value; var newExpMillis = newExpRaw ? new Date(newExpRaw).getTime() : 0; if(!newName) return showToast("App Name required!", true); db.ref('app_control/apps/' + code).update({ name: newName, expiryTime: newExpMillis }).then(() => { closeModal('editModal'); showToast("App updated!"); }); }

        // --- OFFLINE GENERATOR ---
        function generateOfflineCode() {
            var appName = document.getElementById('off-appName').value.trim(); if(!appName) return showToast("Enter App Name!", true);
            var expDateRaw = document.getElementById('off-expiryDate').value; if(!expDateRaw) return showToast("Expiry Date Required!", true);
            var expTimeMillis = new Date(expDateRaw).getTime();
            
            var uBg = document.getElementById('offUiBg').value; var uPri = document.getElementById('offUiPrimary').value; var uTxt = document.getElementById('offUiText').value; var uDan = document.getElementById('offUiDanger').value; var uRad = document.getElementById('offUiRadius').value || "60"; var uBtnRad = document.getElementById('offUiBtnRadius').value || "30"; var uDim = document.getElementById('offUiDim').value || "0.25"; var uBlur = document.getElementById('offUiBlur').value || "25"; var uBw = document.getElementById('offUiBorderW').value || "0"; var uBc = document.getElementById('offUiBorderC').value || "#000000";
            var tag = escapeJava(document.getElementById("off-topTag").value); var logo = document.getElementById("off-logoUrl").value; var title = escapeJava(document.getElementById("off-popTitle").value); var sub = escapeJava(document.getElementById("off-subTitle").value); var msg = escapeJava(document.getElementById("off-popMsg").value); var w1 = escapeJava(document.getElementById("off-wn1").value); var w2 = escapeJava(document.getElementById("off-wn2").value); var w3 = escapeJava(document.getElementById("off-wn3").value); var btnTxt = escapeJava(document.getElementById("off-btnText").value);
            var action = document.getElementById("off-btnAction").value; var url = document.getElementById("off-linkUrl").value;
            var clickAction = action === "link" ? `android.content.Intent intent = new android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse("${url}")); startActivity(intent); finishAffinity();` : `finishAffinity();`;

            var javaCode = getJavaString(false, appName, "", expTimeMillis, uBg, uPri, uTxt, uDan, uRad, uBtnRad, uDim, uBlur, uBw, uBc, tag, logo, title, sub, msg, w1, w2, w3, btnTxt, clickAction, action === "exit");

            currentOfflineCode = javaCode;

            var record = { id: Date.now(), name: appName, expTime: expTimeMillis, code: javaCode };
            offlineAppsArray.unshift(record); localStorage.setItem(getStorageKey('offlineAppsHistory'), JSON.stringify(offlineAppsArray));
            document.getElementById('off-outputBox').style.display = "block"; document.getElementById('off-appName').value = ""; renderOffList(); showToast("Offline Code Ready!");
        }

        function loadOfflineData() { offlineAppsArray = JSON.parse(localStorage.getItem(getStorageKey('offlineAppsHistory')) || '[]'); renderOffList(); }
        
        function renderOffList() {
            var listContainer = document.getElementById('off-appListContainer'); var searchQuery = document.getElementById('off-searchInput').value.toLowerCase(); listContainer.innerHTML = '';
            let active = 0, expired = 0, now = Date.now();
            if(offlineAppsArray.length === 0) { listContainer.innerHTML = '<li style="text-align: center; color: #555; padding: 20px;">No offline codes generated yet.</li>'; document.getElementById('stat-off-total').innerText = 0; document.getElementById('stat-off-active').innerText = 0; document.getElementById('stat-off-expired').innerText = 0; return; }
            var filteredData = offlineAppsArray.filter(app => { return (app.name && app.name.toLowerCase().includes(searchQuery)); });
            filteredData.forEach(app => {
                let isExpired = now >= app.expTime; if(isExpired) expired++; else active++;
                let badgeClass = isExpired ? "b-expired" : "b-active"; let statusTxt = isExpired ? "EXPIRED" : "ACTIVE"; let expTxt = new Date(app.expTime).toLocaleString('en-IN');
                var li = document.createElement('li'); li.className = "app-item";
                li.innerHTML = `
                    <div class="app-info"><h4>${app.name} <span class="badge ${badgeClass}">${statusTxt}</span></h4><p>⏱️ Lock Timer: ${expTxt}</p></div>
                    <div class="app-controls">
                        <button class="btn-small btn-view" onclick="openCodeModal(${app.id}, 'off')"><i class="fas fa-code"></i></button>
                        <button class="btn-small btn-delete" onclick="deleteOffApp(${app.id})"><i class="fas fa-trash"></i></button>
                    </div>`;
                listContainer.appendChild(li);
            });
            document.getElementById('stat-off-total').innerText = offlineAppsArray.length; document.getElementById('stat-off-active').innerText = active; document.getElementById('stat-off-expired').innerText = expired;
        }

        function deleteOffApp(id) { if(confirm("Delete this offline record?")) { offlineAppsArray = offlineAppsArray.filter(a => a.id !== id); localStorage.setItem(getStorageKey('offlineAppsHistory'), JSON.stringify(offlineAppsArray)); renderOffList(); showToast("Record Deleted"); } }

        // --- SUPPORT & TICKETS ---
        var supportConfig = { devName: 'PRINCE HACKS', whatsapp: '', telegram: '' };
        var myTicketsListener = null;

        // --- NOTIFICATIONS ---
        var notifListener = null;
        var notificationsCache = [];

        function startNotifListener() {
            if (notifListener) { db.ref('notifications').off('value', notifListener); notifListener = null; }
            notifListener = db.ref('notifications').on('value', function(snap) {
                notificationsCache = [];
                snap.forEach(function(child) { var n = child.val(); n.key = child.key; notificationsCache.push(n); });
                renderNotifBadge();
                renderNotifList();
            });
        }

        function getUserNotifs() {
            var loggedUser = sessionStorage.getItem('panelLoggedUser') || '';
            return notificationsCache.filter(function(n) {
                return (n.target === 'ALL' || n.user === loggedUser) && !(n.hiddenFor && n.hiddenFor[loggedUser]);
            });
        }

        function renderNotifBadge() {
            var badge = document.getElementById('bellBadge');
            if (!badge) return;
            var loggedUser = sessionStorage.getItem('panelLoggedUser') || '';
            var unread = 0;
            var notifs = getUserNotifs();
            for (var i = 0; i < notifs.length; i++) {
                if (!(notifs[i].readBy && notifs[i].readBy[loggedUser])) unread++;
            }
            badge.innerText = unread;
            badge.style.display = unread > 0 ? 'flex' : 'none';
        }

        function renderNotifList() {
            var list = document.getElementById('notifList');
            if (!list) return;
            var loggedUser = sessionStorage.getItem('panelLoggedUser') || '';
            var notifs = getUserNotifs().sort(function(a, b) { return (b.time || 0) - (a.time || 0); });
            var clearBtn = document.getElementById('notifClearBtn');
            if (clearBtn) clearBtn.style.display = notifs.length > 0 ? 'flex' : 'none';
            if (notifs.length === 0) {
                list.innerHTML = '<div style="text-align:center;color:var(--text3);padding:30px;"><i class="fas fa-bell-slash" style="font-size:26px;opacity:0.4;"></i><p style="margin-top:10px;">No notifications yet.</p></div>';
                return;
            }
            var html = '';
            for (var i = 0; i < notifs.length; i++) {
                var n = notifs[i];
                var read = n.readBy && n.readBy[loggedUser];
                var d = new Date(n.time || Date.now());
                var time = d.toLocaleDateString('en-IN') + ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                html += '<div class="notif-item' + (read ? '' : ' unread') + '">' +
                    '<p>' + escapeHtml(n.text) + '</p>' +
                    '<small><i class="fas fa-crown" style="color:var(--primary);"></i> ADMIN &middot; ' + time + '</small>' +
                    '</div>';
            }
            list.innerHTML = html;
        }

        function openNotifications() {
            var modal = document.getElementById('notifModal');
            modal.classList.add('show');
            var loggedUser = sessionStorage.getItem('panelLoggedUser') || '';
            if (loggedUser) {
                var notifs = getUserNotifs();
                for (var i = 0; i < notifs.length; i++) {
                    db.ref('notifications/' + notifs[i].key + '/readBy/' + loggedUser).set(true);
                }
            }
            renderNotifBadge();
        }

        function clearNotifications() {
            var notifs = getUserNotifs();
            if (notifs.length === 0) return;
            if (!confirm('Clear all notifications from your account?')) return;
            var loggedUser = sessionStorage.getItem('panelLoggedUser') || '';
            if (!loggedUser) return;
            for (var i = 0; i < notifs.length; i++) {
                db.ref('notifications/' + notifs[i].key + '/hiddenFor/' + loggedUser).set(true);
                db.ref('notifications/' + notifs[i].key + '/readBy/' + loggedUser).set(true);
            }
            notificationsCache = [];
            renderNotifBadge();
            renderNotifList();
            showToast('Notifications cleared from your account!');
        }

        function escapeHtml(str) {
            return String(str == null ? '' : str).replace(/[&<>"']/g, function(c) {
                return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
            });
        }

        function loadSupportConfig() {
            db.ref('support_config').on('value', function(snap) {
                var c = snap.val() || {};
                supportConfig = {
                    devName: c.devName || 'PRINCE HACKS',
                    whatsapp: c.whatsapp || '',
                    telegram: c.telegram || ''
                };
                document.getElementById('supDevName').innerText = supportConfig.devName;
                document.getElementById('supWaText').innerText = supportConfig.whatsapp ? 'WhatsApp' : 'WhatsApp (Not Set)';
                document.getElementById('supTgText').innerText = supportConfig.telegram ? 'Telegram' : 'Telegram (Not Set)';
                var lWa = document.getElementById('loginWaText'); if (lWa) lWa.innerText = supportConfig.whatsapp ? 'WhatsApp' : 'WhatsApp (Not Set)';
                var lTg = document.getElementById('loginTgText'); if (lTg) lTg.innerText = supportConfig.telegram ? 'Telegram' : 'Telegram (Not Set)';
            });
        }

        function openSupportLink(type) {
            var url = type === 'wa' ? supportConfig.whatsapp : supportConfig.telegram;
            if (!url) return showToast('Support link not set by admin yet!', true);
            window.open(url, '_blank');
        }

        var TICKET_COOLDOWN = 5 * 60 * 1000;

        function getLastTicketTime(user, cb) {
            db.ref('support_tickets').orderByChild('timestamp').once('value', function(snap) {
                var last = 0;
                snap.forEach(function(child) { var t = child.val(); if (t.user === user && t.timestamp > last) last = t.timestamp; });
                cb(last);
            });
        }

        function sendTicket() {
            var subj = document.getElementById('ticketSubject').value.trim();
            var msg = document.getElementById('ticketMsg').value.trim();
            var user = sessionStorage.getItem('panelLoggedUser') || 'unknown';
            if (!subj) return showToast('Enter a subject!', true);
            if (!msg) return showToast('Enter your message!', true);
            if (msg.length < 10) return showToast('Message too short!', true);
            getLastTicketTime(user, function(lastTime) {
                var waitMs = TICKET_COOLDOWN - (Date.now() - lastTime);
                if (waitMs > 0) {
                    var left = Math.ceil(waitMs / 1000);
                    return showToast('Wait ' + (left >= 60 ? Math.ceil(left / 60) + ' min' : left + ' sec') + ' before new ticket!', true);
                }
                db.ref('support_tickets').push({
                    user: user,
                    subject: subj,
                    message: msg,
                    status: 'open',
                    timestamp: Date.now(),
                    replies: {}
                }).then(function() {
                    document.getElementById('ticketSubject').value = '';
                    document.getElementById('ticketMsg').value = '';
                    showToast('Ticket sent! Admin will reply soon.');
                }).catch(function(e) { showToast('Failed to send!', true); });
            });
        }

        function deleteMyTicket(key) {
            if (!confirm('Delete this ticket?')) return;
            db.ref('support_tickets/' + key).remove().then(function() {
                showToast('Ticket deleted!');
            }).catch(function() { showToast('Failed to delete!', true); });
        }

        function loadMyTickets() {
            if (myTicketsListener) { db.ref('support_tickets').off('value', myTicketsListener); myTicketsListener = null; }
            var user = sessionStorage.getItem('panelLoggedUser') || 'unknown';
            var box = document.getElementById('myTicketsList');
            myTicketsListener = db.ref('support_tickets').orderByChild('timestamp').on('value', function(snap) {
                var tickets = [];
                snap.forEach(function(child) { var t = child.val(); t._key = child.key; if (t.user === user) tickets.push(t); });
                tickets.reverse();
                if (tickets.length === 0) { box.innerHTML = '<p style="color:var(--text3); font-size:12px; padding:10px;">No tickets yet. Aapne abhi tak koi ticket nahi banaya.</p>'; return; }
                var html = '';
                tickets.forEach(function(t) {
                    var statusBadge = t.status === 'resolved' ? '<span class="badge b-active">RESOLVED</span>' : '<span class="badge b-expired">OPEN</span>';
                    html += '<div class="app-item" style="flex-direction:column; align-items:stretch;">' +
                        '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;"><h4>' + escapeHtml(t.subject) + ' ' + statusBadge + '</h4><button class="btn-small btn-delete" onclick="deleteMyTicket(\'' + t._key + '\')" title="Delete Ticket"><i class="fas fa-trash"></i></button></div>' +
                        '<div style="font-size:10px; color:var(--text3); margin-top:2px;">' + new Date(t.timestamp).toLocaleString('en-IN') + '</div>' +
                        '<div style="margin-top:6px;">' +
                            '<div style="font-size:12px; margin-bottom:6px;"><b style="color:var(--primary);">YOU:</b> <span style="color:var(--text2);">' + escapeHtml(t.message) + '</span></div>';
                    var replies = t.replies || {};
                    var keys = Object.keys(replies).sort();
                    if (keys.length > 0) {
                        keys.forEach(function(k) {
                            var r = replies[k];
                            var who = r.from === 'admin' ? 'ADMIN' : 'YOU';
                            var color = r.from === 'admin' ? 'var(--success)' : 'var(--text2)';
                            html += '<div style="font-size:12px; margin-bottom:6px;"><b style="color:' + color + ';">' + who + ':</b> <span style="color:var(--text2);">' + escapeHtml(r.text) + '</span></div>';
                        });
                    }
                    html += '</div>' +
                        '<div style="display:flex;gap:8px;margin-top:10px;">' +
                            '<input type="text" id="ticketReply_' + t._key + '" placeholder="Type reply..." style="flex:1;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);padding-left:14px;" onkeydown="if(event.key===\'Enter\'){sendTicketReply(\'' + t._key + '\')}">' +
                            '<button class="btn-small btn-edit" onclick="sendTicketReply(\'' + t._key + '\')"><i class="fas fa-paper-plane"></i></button>' +
                        '</div>' +
                    '</div>';
                });
                box.innerHTML = html;
            });
        }

        function sendTicketReply(key) {
            var inp = document.getElementById('ticketReply_' + key);
            if (!inp) return;
            var text = inp.value.trim();
            if (!text) return showToast('Type a message first!', true);
            var user = sessionStorage.getItem('panelLoggedUser') || 'unknown';
            db.ref('support_tickets/' + key + '/replies/' + Date.now()).set({ from: 'user', text: text, time: Date.now() }).then(function() {
                db.ref('support_tickets/' + key).update({ status: 'open' });
                inp.value = '';
                showToast('Reply sent!');
            }).catch(function(e) { showToast('Failed to send!', true); });
        }

        // --- USER AUTHENTICATION ---
        var DEFAULT_USER = 'user';
        var DEFAULT_PASS = 'user123';
        var fbUsers = [];
        var fbUsersLoaded = false;

        function loadFBUsers(callback) {
            if (fbUsersLoaded) { if (callback) callback(); return; }
            db.ref('admin_control/users').once('value', function(snapshot) {
                fbUsers = [];
                snapshot.forEach(function(child) {
                    var user = child.val();
                    user._key = child.key;
                    fbUsers.push(user);
                });
                fbUsersLoaded = true;
                if (callback) callback();
            }, function(err) {
                if (callback) callback(err);
            });
        }

        function saveUserRemember() {
            if (document.getElementById('savePass').checked) {
                localStorage.setItem('userSavedLogin', JSON.stringify({
                    user: document.getElementById('loginUser').value.trim(),
                    pass: document.getElementById('loginPass').value
                }));
            } else {
                localStorage.removeItem('userSavedLogin');
            }
        }

        function loadUserRemember() {
            var saved = localStorage.getItem('userSavedLogin');
            if (saved) {
                try {
                    var d = JSON.parse(saved);
                    document.getElementById('loginUser').value = d.user || '';
                    document.getElementById('loginPass').value = d.pass || '';
                    document.getElementById('savePass').checked = true;
                } catch(e) {}
            }
        }

        function getDeviceId() {
            var d = localStorage.getItem('_deviceId');
            if (!d) {
                d = Math.random().toString(16).substr(2, 16);
                localStorage.setItem('_deviceId', d);
            }
            return d;
        }

        function getDeviceInfo() {
            var id = getDeviceId();
            var ua = navigator.userAgent || '';
            var model = 'Unknown Device';
            var andMatch = ua.match(/Android\s+[\d.]+/);
            if (andMatch) {
                var mMatch = ua.match(/; ([^;]*?) Build\//);
                model = mMatch ? mMatch[1].trim() : 'Android Device';
            } else if (/iPhone/i.test(ua)) { model = 'iPhone'; }
            else if (/iPad/i.test(ua)) { model = 'iPad'; }
            else if (/Windows/i.test(ua)) { model = 'Windows Laptop/PC'; }
            else if (/Macintosh/i.test(ua)) { model = 'Apple Mac'; }
            else if (/Linux/i.test(ua)) { model = 'Linux Device'; }
            else if (/CrOS/i.test(ua)) { model = 'Chromebook'; }
            var browser = 'Unknown Browser';
            if (/Chrome/i.test(ua) && !/Edge/i.test(ua)) browser = 'Chrome';
            else if (/Firefox/i.test(ua)) browser = 'Firefox';
            else if (/Safari/i.test(ua)) browser = 'Safari';
            else if (/Edge/i.test(ua)) browser = 'Edge';
            return { id: id, model: model, browser: browser, platform: navigator.platform || (andMatch ? 'Android' : ''), firstSeen: Date.now(), lastSeen: Date.now() };
        }

        function userLogin() {
            var u = document.getElementById('loginUser').value.trim();
            var p = document.getElementById('loginPass').value;
            var e = document.getElementById('loginError');
            if(!u || !p) { e.textContent='Enter username and password!'; e.style.display='block'; return; }
            loadFBUsers(function() {
                if (fbUsers.length === 0) {
                    if (u === DEFAULT_USER && p === DEFAULT_PASS) {
                        finishLogin(u);
                    } else {
                        e.textContent='Invalid credentials! Contact admin.'; e.style.display='block';
                    }
                    return;
                }
                var userData = null;
                for (var i = 0; i < fbUsers.length; i++) {
                    if (fbUsers[i].username === u && fbUsers[i].password === p) { userData = fbUsers[i]; break; }
                }
                if (!userData) { e.textContent='Invalid credentials! Contact admin.'; e.style.display='block'; return; }
                var limit = userData.deviceLimit || 0;
                var lockedDevices = (userData.lockedDevices || []).slice();
                var currentDevice = getDeviceId();
                var devInfo = getDeviceInfo();
                var deviceExists = false;
                for (var i = 0; i < lockedDevices.length; i++) {
                    var d = lockedDevices[i];
                    var dId = (typeof d === 'string') ? d : (d.id || '');
                    if (dId === currentDevice) {
                        lockedDevices[i] = { id: dId, model: d.model || devInfo.model, browser: d.browser || devInfo.browser, platform: d.platform || devInfo.platform, firstSeen: d.firstSeen || Date.now(), lastSeen: Date.now() };
                        deviceExists = true;
                        break;
                    }
                }
                if (!deviceExists) {
                    if (limit > 0 && lockedDevices.length >= limit) {
                        e.textContent = 'Device limit reached! (Limit: ' + limit + ' device' + (limit > 1 ? 's' : '') + '). Is account pe pehle se devices login hain. Dusri device se login karne ke liye admin se contact karein!';
                        e.style.display = 'block';
                        return;
                    }
                    lockedDevices.push(devInfo);
                }
                db.ref('admin_control/users/' + userData._key + '/lockedDevices').set(lockedDevices);
                finishLogin(u);
            });
        }

        var SESSION_MS = 24 * 60 * 60 * 1000;

        function checkSessionTimeout() {
            if (sessionStorage.getItem('panelLoggedIn') !== 'true') return;
            var t = parseInt(sessionStorage.getItem('panelLoginTime'), 10);
            if (t && Date.now() - t >= SESSION_MS) {
                showToast('Session expired (24 hours)! Please login again.', true);
                userLogout();
            }
        }

        function checkProfileStatus() {
            var alertEl = document.getElementById('profileAlert');
            if (!alertEl) return;
            var loggedUser = sessionStorage.getItem('panelLoggedUser');
            if (!loggedUser) { alertEl.style.display = 'none'; return; }
            loadFBUsers(function() {
                var found = false;
                for (var i = 0; i < fbUsers.length; i++) {
                    if (fbUsers[i].username === loggedUser) {
                        found = true;
                        var p = fbUsers[i].profile || {};
                        alertEl.style.display = (p.name || p.contact || p.youtube || p.telegram) ? 'none' : 'flex';
                        break;
                    }
                }
                if (!found) alertEl.style.display = 'flex';
            });
        }

        function setUserPresence(status) {
            var loggedUser = sessionStorage.getItem('panelLoggedUser');
            if (!loggedUser) return;
            loadFBUsers(function() {
                for (var i = 0; i < fbUsers.length; i++) {
                    if (fbUsers[i].username === loggedUser) {
                        var uRef = db.ref('admin_control/users/' + fbUsers[i]._key);
                        uRef.update({ online: status, lastSeen: Date.now() });
                        if (status) {
                            uRef.child('online').onDisconnect().set(false);
                            uRef.child('lastSeen').onDisconnect().set(Date.now());
                        } else {
                            uRef.child('online').onDisconnect().cancel();
                            uRef.child('lastSeen').onDisconnect().cancel();
                        }
                        break;
                    }
                }
            });
        }

        function finishLogin(u) {
            saveUserRemember();
            document.getElementById('loginUser').value=''; document.getElementById('loginPass').value='';
            document.getElementById('loginOverlay').classList.add('hidden');
            sessionStorage.setItem('panelLoggedIn','true');
            sessionStorage.setItem('panelLoggedUser', u);
            sessionStorage.setItem('panelLoginTime', String(Date.now()));
            document.getElementById('settingsCurUser').value = u;
            document.getElementById('sidebarUserName').textContent = u;
            loadFormState();
            loadOfflineData();
            loadMyTickets();
            loadUserProfile();
            checkPasswordChangePermission();
            setUserPresence(true);
            checkProfileStatus();
            renderNotifBadge();
            renderNotifList();
            showToast('Welcome!');
        }

        function userLogout() {
            setUserPresence(false);
            var pal = document.getElementById('profileAlert');
            if (pal) pal.style.display = 'none';
            sessionStorage.removeItem('panelLoggedIn');
            sessionStorage.removeItem('panelLoggedUser');
            sessionStorage.removeItem('panelLoginTime');
            document.getElementById('sidebarUserName').textContent = 'Guest';
            document.getElementById('loginOverlay').classList.remove('hidden');
            document.getElementById('loginError').style.display='none';
            loadUserRemember();
            loadUserProfile();
            if (myTicketsListener) { db.ref('support_tickets').off('value', myTicketsListener); myTicketsListener = null; }
            if (notifListener) { db.ref('notifications').off('value', notifListener); notifListener = null; }
            notificationsCache = [];
            var badge = document.getElementById('bellBadge');
            if (badge) { badge.style.display = 'none'; }
            // Clear form and offline for next user
            formIds.forEach(id => { var el = document.getElementById(id); if(el) { if(id.includes('-actionTxt')) el.innerText = 'Select Action'; else el.value = ''; } });
            offlineAppsArray = [];
            renderOffList();
        }

        function changeUserCredentials() {
            var oldPass = document.getElementById('settingsOldPass').value;
            var newPass = document.getElementById('settingsNewPass').value;
            var loggedUser = sessionStorage.getItem('panelLoggedUser');
            var msg = document.getElementById('settingsMsg');
            msg.style.display='none';
            var canChange = false;
            for (var i = 0; i < fbUsers.length; i++) {
                if (fbUsers[i].username === loggedUser) { canChange = !!fbUsers[i].canChangePassword; break; }
            }
            if (!canChange) { showToast('Password change not allowed. Contact admin!', true); return; }
            if(!oldPass || !newPass) { msg.textContent='All fields required!'; msg.style.color='#FF4C4C'; msg.style.display='block'; return; }
            if(newPass.length<4) { msg.textContent='Password min 4 chars!'; msg.style.color='#FF4C4C'; msg.style.display='block'; return; }
            loadFBUsers(function() {
                var found = false;
                for (var i = 0; i < fbUsers.length; i++) {
                    if (fbUsers[i].username === loggedUser) {
                        if (fbUsers[i].password !== oldPass) { msg.textContent='Wrong current password!'; msg.style.color='#FF4C4C'; msg.style.display='block'; return; }
                        db.ref('admin_control/users/' + fbUsers[i]._key).update({ password: newPass });
                        found = true;
                        break;
                    }
                }
                if (!found && loggedUser === DEFAULT_USER) {
                    if (oldPass !== DEFAULT_PASS) { msg.textContent='Wrong current password!'; msg.style.color='#FF4C4C'; msg.style.display='block'; return; }
                    db.ref('admin_control/users').push({
                        username: loggedUser, password: newPass, device: 'Default',
                        deviceLimit: 1, lockedDevices: [], created: Date.now()
                    });
                    found = true;
                }
                if (!found) { msg.textContent='User not found!'; msg.style.color='#FF4C4C'; msg.style.display='block'; return; }
                document.getElementById('settingsOldPass').value=''; document.getElementById('settingsNewPass').value='';
                msg.textContent='Password updated!'; msg.style.color='#00E676'; msg.style.display='block';
                showToast('Password updated!');
            });
        }

        function loadUserProfile() {
            var loggedUser = sessionStorage.getItem('panelLoggedUser');
            var nameEl = document.getElementById('profileName');
            if (!nameEl) return;
            nameEl.value = '';
            var contactEl = document.getElementById('profileContact'); if (contactEl) contactEl.value = '';
            var ytEl = document.getElementById('profileYoutube'); if (ytEl) ytEl.value = '';
            var tgEl = document.getElementById('profileTelegram'); if (tgEl) tgEl.value = '';
            var saveBtn = document.getElementById('profileSaveBtn');
            var lockMsg = document.getElementById('profileLockMsg');
            if (!loggedUser) return;
            loadFBUsers(function() {
                var editAllowed = true;
                for (var i = 0; i < fbUsers.length; i++) {
                    if (fbUsers[i].username === loggedUser) {
                        if (fbUsers[i].profileEdit === false) editAllowed = false;
                        var p = fbUsers[i].profile || {};
                        nameEl.value = p.name || '';
                        if (contactEl) contactEl.value = p.contact || '';
                        if (ytEl) ytEl.value = p.youtube || '';
                        if (tgEl) tgEl.value = p.telegram || '';
                        break;
                    }
                }
                nameEl.readOnly = !editAllowed;
                if (contactEl) contactEl.readOnly = !editAllowed;
                if (ytEl) ytEl.readOnly = !editAllowed;
                if (tgEl) tgEl.readOnly = !editAllowed;
                if (saveBtn) saveBtn.style.display = editAllowed ? 'inline-flex' : 'none';
                if (lockMsg) lockMsg.style.display = editAllowed ? 'none' : 'block';
                checkPasswordChangePermission();
            });
        }

        function checkPasswordChangePermission() {
            var loggedUser = sessionStorage.getItem('panelLoggedUser');
            var form = document.getElementById('passwordChangeForm');
            var blocked = document.getElementById('passwordBlockedMsg');
            if (!form || !blocked) return;
            if (!loggedUser) { form.style.display = 'none'; blocked.style.display = 'none'; return; }
            var canChange = false;
            for (var i = 0; i < fbUsers.length; i++) {
                if (fbUsers[i].username === loggedUser) {
                    canChange = !!fbUsers[i].canChangePassword;
                    break;
                }
            }
            if (canChange) {
                form.style.display = 'block';
                blocked.style.display = 'none';
            } else {
                form.style.display = 'none';
                blocked.style.display = 'block';
            }
        }

        function saveUserProfile() {
            var name = document.getElementById('profileName').value.trim();
            var contact = document.getElementById('profileContact').value.trim();
            var youtube = document.getElementById('profileYoutube').value.trim();
            var telegram = document.getElementById('profileTelegram').value.trim();
            var loggedUser = sessionStorage.getItem('panelLoggedUser');
            var msg = document.getElementById('profileMsg');
            msg.style.display = 'none';
            if (!loggedUser) { msg.textContent = 'Login first!'; msg.style.color = '#FF4C4C'; msg.style.display = 'block'; return; }
            loadFBUsers(function() {
                var found = false;
                for (var i = 0; i < fbUsers.length; i++) {
                    if (fbUsers[i].username === loggedUser) {
                        found = true;
                        if (fbUsers[i].profileEdit === false) {
                            msg.textContent = 'Profile editing is disabled by admin!';
                            msg.style.color = '#FF4C4C';
                            msg.style.display = 'block';
                            showToast('Profile editing disabled by admin!', true);
                            return;
                        }
                        db.ref('admin_control/users/' + fbUsers[i]._key).update({ profile: { name: name, contact: contact, youtube: youtube, telegram: telegram } });
                        break;
                    }
                }
                if (!found) {
                    db.ref('admin_control/users').push({
                        username: loggedUser, password: DEFAULT_PASS, device: 'Default',
                        deviceLimit: 1, lockedDevices: [], created: Date.now(),
                        profile: { name: name, contact: contact, youtube: youtube, telegram: telegram }
                    });
                }
                msg.textContent = 'Profile saved!'; msg.style.color = '#00E676'; msg.style.display = 'block';
                showToast('Profile saved!');
                var pal = document.getElementById('profileAlert');
                if (pal) pal.style.display = (name || contact || youtube || telegram) ? 'none' : 'flex';
            });
        }

        function checkUserAuth() {
            var loggedIn = sessionStorage.getItem('panelLoggedIn');
            if (loggedIn === 'true') {
                var loggedUser = sessionStorage.getItem('panelLoggedUser') || DEFAULT_USER;
                document.getElementById('loginOverlay').classList.add('hidden');
                document.getElementById('settingsCurUser').value = loggedUser;
                document.getElementById('sidebarUserName').textContent = loggedUser;
                loadUserProfile();
                setUserPresence(true);
                checkSessionTimeout();
                checkProfileStatus();
            } else {
                loadUserRemember();
            }
            if (!fbUsersLoaded) loadFBUsers();
        }

        // --- INIT & LISTENERS ---
        window.onload = function() { 
            checkUserAuth();
            loadFormState();
            updateCloseBtnVisibility('on'); updateCloseBtnVisibility('off');
            loadSupportConfig();
            loadMyTickets();
            startNotifListener();
            
            // Add listeners to auto-save on input change
            formIds.forEach(id => {
                let el = document.getElementById(id);
                if(el && !id.includes('-actionTxt')) {
                    el.addEventListener('input', saveFormState);
                    el.addEventListener('change', saveFormState);
                }
            });
            
            applyOnUI(); 
            applyOffUI(); 
            loadOfflineData(); 
            checkProfileStatus();
            setInterval(checkSessionTimeout, 60000);
        };

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !document.getElementById('loginOverlay').classList.contains('hidden')) {
                userLogin();
            }
        });
    