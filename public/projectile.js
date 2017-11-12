
var projectiles = [];

function getEntityPosition(id) {
    let xPos = entities[id].x;
    let zPos = entities[id].y;

    return [xPos, zPos];
}

function drawProjectile(towerId, targetId) {
    let towerPos = getEntityPosition(towerId);
    let targetPos = getEntityPosition(targetId);

    var geometry = new THREE.SphereGeometry( 0.1, 32, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    var sphere = new THREE.Mesh( geometry, material );
    sphere.position.set(towerPos[0], 0.6, towerPos[1]);
    projectiles.push({mesh: sphere, targetId: targetId});
    scene.add( sphere );
}

function updateProjectiles(delta) {
    return new Promise(function(resolve, reject) {
        projectiles.forEach(function(projectile) {
            if (projectile.targetId in entities) {
                let targetPos = getEntityPosition(projectile.targetId);
                let targetV3Pos = new THREE.Vector3(targetPos[0], 0, targetPos[1]);
                let projectilePos = projectile.mesh.position;
                let dist = targetV3Pos.sub(projectilePos);
                let dir = dist.normalize();

                projectilePos.add(dir.multiplyScalar(delta / 100));
            }

            if (projectiles.indexOf(projectile) == projectiles.length-1) {
                resolve("All projectiles updated!");
            }
      });
  });
}

function deleteProjectiles(message) {
    projectiles = projectiles.filter(function(projectile) {

        let projectilePos = projectile.mesh.position;
        let targetPos = getEntityPosition(projectile.targetId);
        let targetV3Pos = new THREE.Vector3(targetPos[0], 0, targetPos[1]);
        let dist = targetV3Pos.sub(projectilePos);
        if (dist.lengthSq() < 0.05) {
            scene.remove(projectile.mesh);
        }
        return dist.lengthSq() >= 0.05;
    });
}
