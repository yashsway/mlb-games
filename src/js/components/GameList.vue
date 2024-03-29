<template>
  <div class="container games">
    <div class="date">
        <!-- if left or right arrows clicked, call method to add or sub date resp. -->
        <span class="current_date">MLB games on <el-button class="slide" type="default" icon="el-icon-arrow-left" v-on:click="dateSlide('dsc')">&#8592;</el-button>{{ readableDate }}<el-button class="slide" type="default" icon="el-icon-arrow-right" v-on:click="dateSlide('asc')">&#8594;</el-button></span>
        <div class="options_container">
            <div class="picker">
                <span class="picker_label">Favorite Team:</span>
                <!-- populate with team names present in current day -->
                <el-select class="primary_font" v-model="favTeam" placeholder="Pick your favorite team">
                    <el-option
                    v-for="team in teams"
                    :key="team.value"
                    :label="team.label"
                    :value="team.value">
                    </el-option>
                </el-select>
            </div>
            <div class="picker">
                <span class="picker_label">Selected Day:</span>
                <datepicker input-class="datepicker_input" v-model="selectedDate" format="yyyy-MM-dd" placeholder="Pick a day"></datepicker>
            </div>
        </div>
    </div>
    <div class="main">
        <el-table :data="games" class="table_games" v-if="games.length>=1">
            <!-- Really odd behavior here. for some reason I'm unable to define a separate template in the same scope for a scenario where linescore isn't defined. Temporarily put all tags in the same scope, bit repetitive-->
            <el-table-column label="Games & Status" align="center">
                <template slot-scope="props">
                    <!-- set link to game detail view with required params (has props) and query vars -->
                    <router-link :to="{ name: 'game_detail', params: { gameID: props.row.game_pk, location: props.row.location, venue: props.row.venue, winning_pitcher: props.row.winning_pitcher, losing_pitcher: props.row.losing_pitcher, home_runs: props.row.home_runs }, query: { gameDate: receivedDate, favTeam: favTeam }}">
                        <p v-if="props.row.linescore!==undefined" :class="props.row.linescore.r.home > props.row.linescore.r.away ? 'bold_team' : ''"><i class="el-icon-star-on" v-show="props.row.home_team_name==favTeam"></i>{{ props.row.home_team_name }}</p>
                        <p v-if="props.row.linescore!==undefined" :class="props.row.linescore.r.away > props.row.linescore.r.home ? 'bold_team' : ''"><i class="el-icon-star-on" v-show="props.row.away_team_name==favTeam"></i>{{ props.row.away_team_name }}</p>
                        <p v-if="props.row.linescore!==undefined" class="italic_status">{{ props.row.status.status }}</p>
                        <p v-if="props.row.linescore==undefined"><i class="el-icon-star-on" v-show="props.row.home_team_name==favTeam"></i>{{ props.row.home_team_name }}</p>
                        <p v-if="props.row.linescore==undefined"><i class="el-icon-star-on" v-show="props.row.away_team_name==favTeam"></i>{{ props.row.away_team_name }}</p>
                        <p v-if="props.row.linescore==undefined" class="italic_status">{{ props.row.status.status }}</p>
                    </router-link>
                </template>
            </el-table-column>
            <el-table-column label="Score" align="center">
                <template slot-scope="props">
                    <!-- set link to game detail view with required params (has props) and query vars -->
                    <router-link :to="{ name: 'game_detail', params: { gameID: props.row.game_pk, location: props.row.location, venue: props.row.venue, winning_pitcher: props.row.winning_pitcher, losing_pitcher: props.row.losing_pitcher, home_runs: props.row.home_runs }, query: { gameDate: receivedDate, favTeam: favTeam }}">
                        <p v-if="props.row.linescore!==undefined">{{ props.row.linescore.r.home }}</p>
                        <p v-if="props.row.linescore!==undefined">{{ props.row.linescore.r.away }}</p>
                        <p class="italic_status">-</p>
                    </router-link>
                </template>
            </el-table-column>
        </el-table>
        <!-- show if still loading, layout image in the future? -->
        <div class="no_data" v-show="!updated">Loading...</div>
        <!-- show if no games on current day -->
        <div class="no_data" v-if="updated && this.games.length<=0">No games today!</div>
    </div>
  </div>
</template>

<script>
// import axios for HTTP calls, moment for date formatting, lodash for array and collection ops and an open source Datepicker component.
import axios from 'axios';
import moment from 'moment';
import _ from 'lodash';
import Datepicker from 'vuejs-datepicker';

export default {
    name: 'games_list',
    components: {
        Datepicker
    },
    beforeMount: function() {
        // set date if it exists already
        this.selectedDate = this.$route.query.gameDate!==undefined ? this.$route.query.gameDate : this.selectedDate;
        // set favTeam if it exists in query
        this.favTeam = this.$route.query.favTeam!==undefined && this.$route.query.favTeam!==null ? this.$route.query.favTeam : this.favTeam;
        // get data from the API. optional: can override here with custom date, pass in year, month and day, in YYYY, MM and DD respectively
        this.setData();
    },
    // today - tracks of the current user's date
    // selectedDate - tracks date in the date picker
    // receivedDate - tracks date received from the API - used for verification
    // nextDayDate - tracks next day provided by the API
    // games - tracks list of game data happening in day
    // favTeam - default set to B Jays, can be changed in the UI
    data() {
        return {
            updated: false,
            today: moment(),
            selectedDate: '',
            receivedDate: '',
            nextDayDate: '',
            games: [],
            favTeam: 'Blue Jays',
            teams: []
        }
    },
    computed: {
        // human readable date set at start, no recalcs reqd.
        readableDate: function() {
            return moment(this.receivedDate).isValid() ? moment(this.receivedDate).format('ddd MMM DD YYYY') : this.today.format('ddd MMM DD YYYY');
        }
    },
    watch: {
        // watch selectedDate for changes
        selectedDate: function(newDate,prevDate) {
            // set URL query for history compatibility
            this.$route.query.gameDate = this.selectedDate;
            // if valid, convert date and pass on to setData to get new scoreboard from API
            var update = moment(newDate).isValid() ? moment(newDate) : this.today;
            // get data from the API. optional: can override here with custom date, pass in year, month and day, in YYYY, MM and DD respectively
            this.setData(update.format("YYYY"),update.format("MM"),update.format("DD"));
        },
        // watch favTeam for changes
        favTeam: function(newFav,oldFav) {
            // sort if changed
            this.sortByFav();
        }
    },
    methods: {
        // relevant ops to update UI as needed go here
        updateUI: function() {
            this.updated = true;
        },
        setData: _.debounce(function(year = this.today.format("YYYY"),month = this.today.format("MM"),day = this.today.format("DD")) {
            // this method is used to get and process data from the MLB api. default date is the current user's date. takes 3 parameters.
            // inject year month and day into API URL, get scoreboard
            axios.get(`https://gd2.mlb.com/components/game/mlb/year_${year}/month_${month}/day_${day}/master_scoreboard.json`)
            .then((response) => {
                // store once
                var mlbData = response.data.data.games;
                // set receivedDate and nextDayDate
                this.receivedDate = `${mlbData.year}-${mlbData.month}-${mlbData.day}`;
                this.nextDayDate = mlbData.next_day_date;
                // if no games in day, set to empty array
                // If it's an array (multiple games) spread games into array, else inject single game into array
                if(mlbData.game!==undefined){
                    this.games = Array.isArray(mlbData.game) ? [...mlbData.game] : [mlbData.game];
                    this.games = _.map(this.games, function(data) {
                        return _.pick(data,['home_team_name','away_team_name','status.status','linescore.r','game_data_directory','game_pk','location','venue','winning_pitcher','losing_pitcher','home_runs']);
                    });
                } else {
                    this.games = [];
                }
                // expensive function, limit runs. flat Map into array team names from each game. then eliminate duplicates by value
                if (this.games!==undefined && this.games.length!==0) {
                    this.teams = _.uniqBy(_.flatMap(this.games, function(data) {
                        return [{ 'value': data.home_team_name, 'label': data.home_team_name},{ 'value': data.away_team_name, 'label': data.away_team_name}];
                    }), 'value');
                }
                // sort list by favorite
                this.sortByFav();
                // update UI
                this.updateUI();
            })
            .catch((error) => {
                // FUTURE: better error handling
                console.log(error);
                // update UI
                this.updateUI();
            });
        }, 500),
        sortByFav: function(teamName = this.favTeam) {
            // if only 1 game in day, just return.
            if (this.games.length==1) return;
            // this method is used to sort a list of games by a favorite team. default team is set in data object. two parameters: one for a team and one for the unmanipulated list of games
            // find game objects that contain a home_team or away_team equal to fav team name, then spread rest of the array that don't contain fav team after it
            var sorted = [ _.find(this.games, function(g) { return g.home_team_name == teamName || g.away_team_name == teamName; }), ...(_.filter(this.games, function(data) { return data.home_team_name != teamName && data.away_team_name != teamName; }))];
            // if any undefined present in the sorted list, set to blank, else store games as the sorted list
            this.games = sorted.includes(undefined) ? [...(_.filter(this.games, function(data) { return data!==undefined; }))] : sorted;
        },
        dateSlide: function(slide) {
            this.selectedDate = (slide=='asc') ? moment(this.receivedDate).add(1,'days')._d : moment(this.receivedDate).subtract(1,'days')._d;
        }
    }
}
</script>

<style lang='postcss' scoped>
/* Kept styles as close to name conventions as possible. Could be incredibly more modular with PostCSS @apply and :root */
a {
  color: #000;
  text-decoration: none;
}
.primary_font {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
}
.container.games {
    grid-area: data;
    align-self: stretch;
    padding: 1rem;
}
.date_container {
    display: flex;
    flex-direction: column;
    justify-content: center;
}
.options_container {
    display: flex;
    flex-direction: row;
    justify-content: center;
    flex: 0 1 auto;
}
.current_date {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 5px 0px;
}
.picker {
    font-family: inherit;
    align-self: center;
    margin: 10px;
    & > .picker_label {
        color: #909399;
    }
    & > * {
        display: inline-block;
    }
}
.table_games {
    width: 100%;
}
.no_data {
    font-size: 2rem;
    padding: 3rem 0rem;
    color: #F56C6C;
}
.bold_team {
    font-weight: bold;
}
.italic_status {
    font-style: italic;
    color: #909399;
}
.slide {
    padding: 5px;
    display: inline-block;
    margin: 3px 3px;
    line-height: 1.5rem;
}
</style>
