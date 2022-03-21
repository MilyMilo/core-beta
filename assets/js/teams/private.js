import $ from "jquery";
import "bootstrap/dist/js/bootstrap.bundle";
import Alpine from "alpinejs";
import CTFd from "../index";
import { serializeJSON } from "@ctfdio/ctfd-js/forms";
import { copyToClipboard } from "../utils/clipboard";
import embed from "vega-embed";
import dayjs from "dayjs";

window.Alpine = Alpine;

Alpine.store("inviteToken", "");

Alpine.data("TeamEditModal", () => ({
  success: null,
  error: null,
  initial: null,
  errors: [],

  init() {
    this.initial = serializeJSON(this.$el.querySelector("form"));
  },

  async updateProfile() {
    let data = serializeJSON(this.$el, this.initial, true);

    data.fields = [];

    for (const property in data) {
      if (property.match(/fields\[\d+\]/)) {
        let field = {};
        let id = parseInt(property.slice(7, -1));
        field["field_id"] = id;
        field["value"] = data[property];
        data.fields.push(field);
        delete data[property];
      }
    }

    let response = await CTFd.pages.teams.updateTeamSettings(data);
    if (response.success) {
      this.success = true;
      this.error = false;
      setTimeout(() => {
        this.success = null;
        this.error = null;
      }, 3000);
    } else {
      this.success = false;
      this.error = true;
      Object.keys(response.errors).map((error) => {
        const error_msg = response.errors[error];
        this.errors.push(error_msg);
      });
    }
  },
}));

Alpine.data("TeamCaptainModal", () => ({
  success: null,
  error: null,
  errors: [],

  async updateCaptain() {
    let data = serializeJSON(this.$el, null, true);
    let response = await CTFd.pages.teams.updateTeamSettings(data);

    if (response.success) {
      window.location.reload();
    } else {
      this.success = false;
      this.error = true;
      Object.keys(response.errors).map((error) => {
        const error_msg = response.errors[error];
        this.errors.push(error_msg);
      });
    }
  },
}));

Alpine.data("TeamInviteModal", () => ({
  copy() {
    copyToClipboard(this.$refs.link);
  },
}));

Alpine.data("TeamDisbandModal", () => ({
  async disbandTeam() {
    let response = await CTFd.pages.teams.disbandTeam();
    if (response.success) {
      window.location.reload();
    } else {
      alert(response.errors[""].join(" "));
    }
  },
}));

Alpine.data("CaptainMenu", () => ({
  captain: false,

  editTeam() {
    $("#team-edit-modal").modal();
  },
  chooseCaptain() {
    $("#team-captain-modal").modal();
  },
  async inviteMembers() {
    let response = await CTFd.pages.teams.getInviteToken();
    if (response.success) {
      let code = response.data.code;
      let url = `${window.location.origin}${CTFd.config.urlRoot}/teams/invite?code=${code}`;
      $("#team-invite-modal input[name=link]").val(url);
      $("#team-invite-modal").modal();
      this.$store.inviteToken = url;
      $("#team-invite-modal").modal();
    }
  },
  disbandTeam() {
    $("#team-disband-modal").modal();
  },
}));

export function cumulativeSum(arr) {
  let result = arr.concat();
  for (let i = 0; i < arr.length; i++) {
    result[i] = arr.slice(0, i + 1).reduce(function(p, i) {
      return p + i;
    });
  }
  return result;
}

async function renderGraphs() {
  let solves = await CTFd.pages.teams.teamSolves("me");
  let fails = await CTFd.pages.teams.teamFails("me");
  let awards = await CTFd.pages.teams.teamAwards("me");
  let spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "Solves and Fails Graph",
    data: {
      values: [
        {
          category: "Solves",
          value: solves.meta.count,
        },
        {
          category: "Fails",
          value: fails.meta.count,
        },
      ],
    },
    width: "container",

    layer: [
      {
        params: [
          {
            name: "category",
            select: {
              type: "point",
              fields: ["category"],
            },
            bind: "legend",
          },
        ],
        mark: {
          type: "arc",
          innerRadius: 50,
          outerRadius: 95,
          stroke: "#fff",
        },
        encoding: {
          opacity: {
            condition: {
              param: "category",
              value: 1,
            },
            value: 0.2,
          },
        },
      },
      {
        mark: {
          type: "text",
          radius: 105,
        },
        encoding: {
          text: {
            field: "value",
            type: "quantitative",
          },
        },
      },
    ],
    encoding: {
      theta: {
        field: "value",
        type: "quantitative",
        stack: true,
      },
      color: {
        field: "category",
        type: "nominal",
        scale: {
          domain: ["Solves", "Fails"],
          range: ["#00d13f", "#cf2600"],
        },
        legend: {
          orient: "bottom",
        },
      },
    },
  };

  embed("#keys-pie-graph", spec)
    .then(function (result) {
      // Access the Vega view instance (https://vega.github.io/vega/docs/api/view/) as result.view
    })
    .catch(console.error);

  const solvesData = solves.data;
  const categories = [];

  for (let i = 0; i < solvesData.length; i++) {
    categories.push(solvesData[i].challenge.category);
  }

  const keys = categories.filter((elem, pos) => {
    return categories.indexOf(elem) == pos;
  });

  const counts = [];
  for (let i = 0; i < keys.length; i++) {
    let count = 0;
    for (let x = 0; x < categories.length; x++) {
      if (categories[x] == keys[i]) {
        count++;
      }
    }
    counts.push(count);
  }

  console.log(keys);
  console.log(counts);

  let values = [];

  keys.forEach((category, index) => {
    values.push({
      category: category,
      value: counts[index],
    });
    // option.legend.data.push(category);
    // option.series[0].data.push({
    //   value: counts[index],
    //   name: category,
    //   itemStyle: { color: colorHash(category) }
    // });
  });

  let spec2 = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "Solves and Fails Graph",
    data: {
      values: values,
    },
    width: "container",

    layer: [
      {
        params: [
          {
            name: "category",
            select: {
              type: "point",
              fields: ["category"],
            },
            bind: "legend",
          },
        ],
        mark: {
          type: "arc",
          innerRadius: 50,
          outerRadius: 95,
          stroke: "#fff",
        },
        encoding: {
          opacity: {
            condition: {
              param: "category",
              value: 1,
            },
            value: 0.2,
          },
        },
      },
      {
        mark: {
          type: "text",
          radius: 105,
        },
        encoding: {
          text: {
            field: "value",
            type: "quantitative",
          },
        },
      },
    ],
    encoding: {
      theta: {
        field: "value",
        type: "quantitative",
        stack: true,
      },
      color: {
        field: "category",
        type: "nominal",
        // scale: {
        //   domain: ["Solves", "Fails"],
        //   range: ["#00d13f", "#cf2600"],
        // },
        legend: {
          orient: "bottom",
        },
      },
    },
  };

  console.log(spec2);

  embed("#categories-pie-graph", spec2)
    .then(function (result) {
      // Access the Vega view instance (https://vega.github.io/vega/docs/api/view/) as result.view
    })
    .catch(console.error);

  const times = [];
  let scores = [];
  const solvesData2 = solves.data;
  const awardsData = awards.data;
  const total = solvesData2.concat(awardsData);

  total.sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });

  for (let i = 0; i < total.length; i++) {
    const date = dayjs(total[i].date);
    times.push(date.toDate());
    try {
      scores.push(total[i].challenge.value);
    } catch (e) {
      scores.push(total[i].value);
    }
  }

  // times.forEach(time => {
  //   // option.xAxis[0].data.push(time);
  // });

  console.log(times);
  console.log(scores);

  scores = cumulativeSum(scores);

  let valuesData = [];
  times.forEach((time, index) => {
    // option.xAxis[0].data.push(time);
    valuesData.push({
      time: time,
      score: scores[index],
    });
  });

  let spec3 = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "Google's stock price over time.",
    data: {
      values: valuesData,
    },
    width: "container",
    mark: { 
      type: "area", 
      line: true, 
      point: true,
      // interpolate: "step-after",
      tooltip: {"content": "data", "nearest": true}
    },
    encoding: {
      x: { field: "time", type: "temporal" },
      y: { field: "score", type: "quantitative" },
    },
  };

  embed("#score-graph", spec3)
    .then(function (result) {
      // Access the Vega view instance (https://vega.github.io/vega/docs/api/view/) as result.view
    })
    .catch(console.error);
}

renderGraphs();

Alpine.start();
