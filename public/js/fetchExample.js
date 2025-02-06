const callback = (responseStatus, responseData) => {
    console.log("responseStatus:", responseStatus);
    console.log("responseData:", responseData);
  
    if (responseStatus == 401) {
      localStorage.removeItem("token");
      window.location.href = "login.html";
    }
  
    const playerList = document.getElementById("playerList");
    responseData.forEach((player) => {
      const displayItem = document.createElement("div");
      displayItem.className = "col-xl-3 col-lg-3 col-md-4 col-sm-6 col-xs-12 p-3";
      displayItem.innerHTML = `
          <div class="card">
              <div class="card-body">
                  <h5 class="card-title">${player.character_name}</h5>
                  <p class="card-text">
                      Level: ${player.character_level}
                  </p>
                  <a href="#" class="btn btn-primary" id="update-${player.player_id}">Update</a>
                  <a href="#" class="btn btn-danger" id="delete-${player.player_id}">Delete</a>
              </div>
          </div>
          `;
      playerList.appendChild(displayItem);
  
      const updateButton = document.getElementById(`update-${player.player_id}`);
      updateButton.addEventListener("click", (event) => {
        event.preventDefault();
  
        window.location.href = `updatePlayer.html?player_id=${player.player_id}`;
      });
  
      const deleteButton = document.getElementById(`delete-${player.player_id}`);
      deleteButton.addEventListener("click", (event) => {
        event.preventDefault();
        const callbackForDelete = (responseStatus, responseData) => {
          console.log("responseStatus:", responseStatus);
          console.log("responseData:", responseData);
          window.location.reload();
        };
        fetchMethod(currentUrl + "/api/player/" + player.player_id, callbackForDelete, 'DELETE', null, localStorage.getItem("token"));
      });
    });
};
  
fetchMethod(currentUrl + "/api/user/token/player", callback, "GET", null, localStorage.getItem("token"));
  



