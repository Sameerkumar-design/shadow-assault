export function updateUI(health, ammo, maxAmmo, score, currentWeapon = 'Unknown') {
    document.getElementById('health').textContent = `Health: ${health}`;
    document.getElementById('ammo').textContent = `Ammo: ${ammo}/${maxAmmo}`;
    document.getElementById('score').textContent = `Kills: ${score}`;
    
    // Add weapon display if not exists
    let weaponDisplay = document.getElementById('weapon');
    if (!weaponDisplay) {
        weaponDisplay = document.createElement('div');
        weaponDisplay.id = 'weapon';
        weaponDisplay.style.color = 'white';
        weaponDisplay.style.fontFamily = 'Arial';
        document.getElementById('hud').appendChild(weaponDisplay);
    }
    weaponDisplay.textContent = `Weapon: ${currentWeapon.charAt(0).toUpperCase() + currentWeapon.slice(1)}`;
}