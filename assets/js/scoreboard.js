import $ from "jquery";
import "bootstrap/dist/js/bootstrap.bundle";
import Alpine from "alpinejs";
import CTFd from "./index";
import { serializeJSON } from "@ctfdio/ctfd-js/forms";
import { copyToClipboard } from "./utils/clipboard";
import embed from "vega-embed";
import dayjs from "dayjs";

window.Alpine = Alpine;

export function cumulativeSum(arr) {
  let result = arr.concat();
  for (let i = 0; i < arr.length; i++) {
    result[i] = arr.slice(0, i + 1).reduce(function(p, i) {
      return p + i;
    });
  }
  return result;
}

async function renderGraphs(){
    let response = await CTFd.pages.scoreboard.getScoreboardDetail(10);

    const teams = Object.keys(response);
    if (teams.length === 0) {
      return false;
    }

    let totalScores = [];

    for (let i = 0; i < teams.length; i++) {
      const team_score = [];
      const times = [];
      for (let j = 0; j < response[teams[i]]["solves"].length; j++) {
        team_score.push(response[teams[i]]["solves"][j].value);
        const date = dayjs(response[teams[i]]["solves"][j].date);
        times.push(date.toDate());
      }

      const total_scores = cumulativeSum(team_score);
      const team_name = response[teams[i]]["name"];
      let scores = times.map(function(e, i) {
        return {
          "name": team_name,
          "score": total_scores[i],
          "date": e
        }
      });
      console.log(scores);
      totalScores = totalScores.concat(scores)


      // names.push(places[teams[i]]["name"]);
    }

    console.log(totalScores);

    let spec = {
      "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
      "description": "Stock prices of 5 Tech Companies over Time.",
      "data": {"values": totalScores},
      "mark": "line",
      "width": "container",
      "encoding": {
        "x": {"field": "date", "type": "temporal"},
        "y": {"field": "score", "type": "quantitative"},
        "color": {
          "field": "name", 
          "type": "nominal",
          legend: {
            orient: "bottom",
          },
        }
      }
    }
    embed("#score-graph", spec)
    .then(function (result) {
      // Access the Vega view instance (https://vega.github.io/vega/docs/api/view/) as result.view
    })
    .catch(console.error);
    console.log(response);
}

renderGraphs();

Alpine.start();