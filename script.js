//! This code was copied and tweaked from the "tvMaze" in-class lab

var currentResource;
var lastRunQuery = "";
var pageCount = 1;
var currentMaxPages = 0;



async function fetchEntity({resource = null, subresource = null}){
    var failed = false;
    var displayTable = document.getElementById("display-table");
    currentResource = `${resource ? resource : currentResource}${subresource!=null?subresource:""}`;
    console.log(resource);
    console.log(currentResource);
    // https://api.tvmaze.com/shows API LINK
    
    var resourceURI = resource!='teams' ? `http://localhost/wc-api/${resource}` : "https://www.thesportsdb.com/api/v1/json/3/search_all_teams.php";
    console.log(`RESOURCE URI: ${resourceURI} ... ${resource!='teams'}`);
    if(subresource!=null){
        var identifier = document.getElementById("identifier").value;
        console.log(`IDENTIFIER: ${identifier}`);
        if(identifier==null || identifier == undefined || identifier==""){
            alert(`Please enter a ${resource} ID.`);
            failed = true
        }
        const id = `/${document.getElementById("identifier").value}`;
        resourceURI+=`${id!=null ? id : 0}/${subresource}`;
    }
    
    if(!failed){
        //?  page count is meant to be implemented as to be in all resources, but is causing issues with the subresources. As required, I only implemented it functionally with /players
        resourceURI+=`?page=${pageCount}${generateQueryParams()}`;
        console.log(resourceURI);

        var h = new Headers();
        h.append("Accept", "application/json");
        console.log(h.get("Accept"));
        const reqOptions = new Request({
            method: "GET",
            mode: "cors",
            headers: h,
        });

        const response = await fetch(resourceURI, reqOptions);
        

        //! SET PAGE COUNT TO THE PAGE VALUE IN THE JSON
        if(response.ok){
            var res = await response.json();
            pageCount = currentResource == "players" || currentResource == "teams" ? res['page'] : currentResource == "playersgoals" ? res['goals']['page'] : currentResource == "stadiumsmatches" ? res['matches']['page'] : "";
            // string ucfirst code from https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
            console.log(res);
            render(res)
        }else{
            console.log(await response.json());
            alert(`Error: ${response.statusText}`);
        }
    }
    
}

async function nextPage(){
    pageCount++;
    await fetchEntity({resource: "players"});
}

async function previousPage(){
    if(pageCount>1){
        pageCount--;
        await fetchEntity({resource: "players"});
    }
}

async function createPerson(){
    const person = {
        name: document.getElementById("name").value,
        birth_year: document.getElementById("birth_year").value,
        gender: document.getElementById("gender").value,
        is_student: document.getElementById("is_student").value,
        residence_location: document.getElementById("residence_location").value,
        graduation_location: document.getElementById("graduation_location").value,
    };
    
    const strPerson = JSON.stringify([person]);
    
    const reqOptions = {
        method: "POST",
        origin: "localhost",
        headers: {
            "Content-Type":"application/json",
        },
        body: strPerson
    }

    //maybe switch to js alert
    console.log(strPerson);
    const response = await fetch("http://localhost/joblisting-api/persons", reqOptions);
    var statusField = document.getElementById("response");
    if(response.ok){
        statusField.style.color = "green";
    }else{
        statusField.style.color = "red";
    }
    //!  MAKE SURE THIS IS PARSED CORRECTLY
    document.getElementById("response").innerText = response;
    console.log(response);

}

function render(entities){
    
    var displayTable = document.getElementById("display-table");
    displayTable.style.display="flex";
    displayTable.innerHTML= "";
    document.getElementById("buttons").innerHTML=``;
    console.log(`ENTITIES: ${entities}, CURRENT RESOURCE: ${currentResource}`);
    if(entities!=null && entities!=undefined){
        switch(currentResource){
            case "players":
                var content = "<tr><th>Player Id</th><th>First Name</th><th>Last Name</th><th>Birth Date</th><th>Gender</th><th>Position</th></tr>"
                if(entities['data'].length==0){
                    alert("No players found for this query.");
                    break;
                }
                entities['data'].forEach(element => {
                    content += `<tr>`;
                    content += `<td>${element.player_id}</td>`;
                    content += `<td>${element.given_name}</td>`;
                    content += `<td>${element.family_name}</td>`;
                    content += `<td>${element.birth_date}</td>`;
                    content += `<td>${element.female==1 ? "Woman" : "Man"}</td>`;
                    content += `<td>${element.goal_keeper==1 ? "Goalkeeper" : element.defender==1 ? "Defender" : element.midfielder==1 ? "Midfielder" : element.forward==1 ? "Forward" : ""}</td>`;
                    content += `</tr>`;
                });
                displayTable.innerHTML+=content;
                document.getElementById("buttons").innerHTML=`<button onclick='previousPage()'type="button" class="btn btn-primary btn-sm">Previous page</button><button type="button" class="btn btn-primary btn-sm" onclick='nextPage()'>Next page</button><br><p>Current page : ${pageCount}</p>`;
                break;
            case "playersgoals":
                if(entities['goals']['data'].length==0){
                    alert("No goals found for this query.");
                    break;
                }
                var content = "<tr><th>Team</th><th>Match name</th><th>Tournament name</th><th>Team status</th><th>Match period</th><th>Match minute</th>";
                entities["goals"]["data"].forEach(element => {
                    content += "<tr>";
                    content += `<td>${element.team_name}</td>`;
                    content += `<td>${element.match_name}</td>`;
                    content += `<td>${element.tournament_name}</td>`;
                    content += `<td>${element.home_team==1 ? "Home team" : "Away team"}</td>`;
                    content += `<td>${element.match_period}`;
                    content += `<td>${element.minute_regulation}`;

                    //? I wrote this very elaborate own goal ternary statement thing and I don't have the heart to delete it but there's no own goal/penalty info on the extended singleton version of matches so there goes 5 minutes im never getting back
                    //content += `<td>${element.own_goal==1 ? "Own Goal" : "" }${element.penalty == 1 && element.own_goal == 1 ? " and Penalty." : element.penalty==1 ? "Penalty" : !element.penalty && !element.own_goal ? "Valid" : ""}`;
                    
    
                    content += `</tr>`
                    
                });
                displayTable.innerHTML+=content;
                break;
            case "stadiumsmatches":
                if(entities['matches']['data'].length==0){
                    alert("No matches found for this query.");
                    break;
                }
                var content = "<tr><th>Match name</th><th>Tournament ID</th><th>Match ID</th><th>Winner</th><th>Match date</th>";
                entities["matches"]["data"].forEach(element => {
                    content += "<tr>";
                    content += `<td>${element.match_name}</td>`;
                    content += `<td>${element.tournament_id}</td>`;
                    content += `<td>${element.match_id}</td>`;
                    content += `<td>${element.home_team_win==1 ? "Home team" : element.away_team_win==1 ? "Away team" : "Draw"}</td>`;
                    content += `<td>${element.match_date}</td>`;
                    content += `</tr>`
                    
                });
                displayTable.innerHTML+=content;
                break;
            case "teams":
                if(entities['teams'].length==0){
                    alert("No teams found for this query.");
                    break;
                }
                var content = "<tr><th>Team name</th><th>Badge</th><th>Stadium</th><th>Website</th><th>Association</th>";
                entities["teams"].forEach(element => {
                    content += "<tr>";
                    content += `<td>${element.strTeam}</td>`;
                    content += `<td><img src='${element.strTeamBadge}' style='width:100px'></td>`;
                    content += `<td>${element.strStadium!="" ? element.strStadium : "None"}</td>`;
                    content += `<td><a href='https://${element.strWebsite}' style='text-decoration: none; color: black'>${element.strWebsite!="" ? element.strWebsite : "None"}</a></td>`;
                    content += `<td>${element.strAlternate!="" ? element.strAlternate : "None"}</td>`;
                    content += `</tr>`
                    
                });
                displayTable.innerHTML+=content;
                break;
        }
        
    }else{
        alert("No rows found for this query.");
    }
    //! FILL THIS IN FOR EACH ENTITY REQUIRED.
    
    
}

function changeResource(resource){
    document.getElementById("buttons").innerHTML="";
    var displayTable = document.getElementById("display-table");
    displayTable.style.display="none";
    if(currentResource!=resource){
        currentResource = resource;
        pageCount = 1;
    
        var searchForm = document.getElementById("search-form");
        displayTable.innerHTML = "";
        switch(resource){
            case "player":
                searchForm.innerHTML = `<div class="form-group"><label for="exampleInputEmail1">First name</label><input type="text" class="form-control" id="first-name" placeholder="Search for first name."></div><div class="form-group"><label for="exampleInputEmail1">Last name</label><input type="text" class="form-control" id="last-name" placeholder="Search for last name"></div><div class="form-group"><label>Date of birth</label><input type="text" class="form-control" id="date-of-birth" placeholder="YYYY-MM-DD"></div><button style="text-align: right;" onclick="fetchEntity({resource: 'players'})" type="submit" class="btn btn-primary">Get Players</button>`;
                break;
            case "playersgoals":
                searchForm.innerHTML = `<div class="form-group"><label for="exampleInputEmail1">Player ID</label><input type="text" class="form-control" id="identifier" placeholder="Selected player."></div> <div class="form-group"><label for="exampleInputEmail1">Tournament</label><input type="text" class="form-control" id="tournament" placeholder="Search for tournament."></div><div class="form-group"><label for="exampleInputEmail1">Match</label><input type="text" class="form-control" id="match" placeholder="Search for match"></div><div class="form-group"><button style="text-align: right;" onclick="fetchEntity({resource: 'players', subresource: 'goals'})" type="submit" class="btn btn-primary">Get Player Goals</button>`;
                break;
            case "stadiumsmatches":
                searchForm.innerHTML = `<div class="form-group"><label for="exampleInputEmail1">Stadium ID</label><input type="text" class="form-control" id="identifier" placeholder="Selected stadium."></div> <div class="form-group"><label for="exampleInputEmail1">Tournament</label><input type="text" class="form-control" id="tournament" placeholder="Search for tournament."></div><div class="form-group"><label for="exampleInputEmail1">Stage name</label><input type="text" class="form-control" id="stage-name" placeholder="Search for stage name"></div><div class="form-group"><button style="text-align: right;" onclick="fetchEntity({resource: 'stadiums',subresource: 'matches'})" type="submit" class="btn btn-primary">Get Stadium Matches</button>`;
                break;
            case "teams":
                searchForm.innerHTML = `<div class="form-group"><label for="exampleInputEmail1">Sport</label><input type="text" class="form-control" id="sport" placeholder="Search for sport."></div><div class="form-group"><label for="exampleInputEmail1">Country</label><input type="text" class="form-control" id="country" placeholder="Search for country"></div><div class="form-group"><button style="text-align: right;" onclick="fetchEntity({resource: 'teams'})" type="submit" class="btn btn-primary">Get Teams</button>`;
                break;
        }
    }
}

function generateQueryParams(){
    var query = "";
    console.log(`CURRENT RESOURCE: ${currentResource}`);
    //! CHECK WITH THE RIGHT QUERY PARAMS IN THE WC API
    switch(currentResource.toLowerCase()){
        case "players":
            const firstName = document.getElementById("first-name").value;
            const lastName = document.getElementById("last-name").value;
            const dob = document.getElementById("date-of-birth").value;
            console.log(`fname: ${firstName}, lname: ${lastName}, dob: ${dob}`);
            query+=`${firstName ? `&first_name=${firstName}`:""}${lastName ? `&last_name=${lastName}` : ""}${dob ? `&dob=${dob}`:""}`;
            break;
        case "playersgoals":
            var tournament = document.getElementById("tournament").value;
            const match = document.getElementById("match").value;
            query+=`${tournament ? `&tournament=${tournament}`:""}${match ? `&match=${match}` : ""}`;
            break;
        case "stadiumsmatches":
            var tournament = document.getElementById("tournament").value;
            const stageName = document.getElementById("stage-name").value;
            query+=`${tournament ? `&tournament=${tournament}`:""}${stageName ? `&stage-name=${stageName}` : ""}`;
            break;
        case "teams":
            const s = document.getElementById("sport").value;
            const c = document.getElementById("country").value;
            query+=`${s ? `&s=${s}`:""}${c ? `&c=${c}` : ""}`;
            break;
    }
    return query;
}