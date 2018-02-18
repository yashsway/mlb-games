<template>
  <div class="container games">
    <div class="date">
        <span class="current_date">MLB games on <el-button class="slide" type="default" icon="el-icon-arrow-left" v-on:click="dateSlide('dsc')">&#8592;</el-button>{{ readableDate }}<el-button class="slide" type="default" icon="el-icon-arrow-right" v-on:click="dateSlide('asc')">&#8594;</el-button></span>
        <div class="datepicker">
            <datepicker input-class="datepicker_input" :value="''" v-model="selectedDate" format="yyyy-MM-dd" placeholder="Pick a day"></datepicker>
        </div>
    </div>
    <div class="main">
        <el-table :data="games" class="table_games" v-if="games.length>=1">
            <el-table-column label="Games & Status" align="center">
                <!-- Really odd behavior here. for some reason I'm unable to define a separate template in the same scope for a scenario where linescore isn't defined. Temporarily put all tags in the same scope, bit repetitive--> 
                <template slot-scope="props">
                    <router-link :to="{ name: 'game_detail', params: { gameID: props.row.game_pk }, query: { gameDate: receivedDate, gameURL: props.row.game_data_directory }}">
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
                    <router-link :to="{ name: 'game_detail', params: { gameID: props.row.game_pk }, query: { gameDate: receivedDate, gameURL: props.row.game_data_directory }}">
                        <p v-if="props.row.linescore!==undefined">{{ props.row.linescore.r.home }}</p>
                        <p v-if="props.row.linescore!==undefined">{{ props.row.linescore.r.away }}</p>
                        <p class="italic_status">-</p>
                    </router-link>
                </template>
            </el-table-column>
        </el-table>
        <div class="table_none" v-if="games.length<=0">No games today!</div>
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
    created: function() {
        // set today and receivedDate, to the user's current date
        this.today = moment();
        // get data from the API. optional: can override here with custom date, pass in year, month and day, in YYYY, MM and DD respectively
        this.setData();
    },
    beforeMount: function() {
        // set date if it exists already
        this.selectedDate = this.$route.query.gameDate!==undefined ? this.$route.query.gameDate : this.selectedDate;
    },
    // today - tracks of the current user's date
    // selectedDate - tracks date in the date picker
    // receivedDate - tracks date received from the API - used for verification
    // nextDayDate - tracks next day provided by the API
    // games - tracks list of game data happening in day
    // favTeam - default set to B Jays, can be changed in the UI
    data() {
        return {
            today: '',
            selectedDate: '',
            receivedDate: '',
            nextDayDate: '',
            games: [],
            favTeam: 'Blue Jays',
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
            this.setData(update.format("YYYY"),update.format("MM"),update.format("DD"));
        },
    },
    methods: {
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
                if (mlbData.game!==undefined) {
                    // If it's an array (multiple games) spread games into array, else inject single game into array
                    this.games = Array.isArray(mlbData.game) ? [...mlbData.game] : [mlbData.game];
                } else {
                    this.games = [];
                }
                // for each game, extract only necessary fields
                this.games = _.map(this.games, function(data) {
                    return _.pick(data,['home_team_name','away_team_name','status.status','linescore.r','game_data_directory','game_pk']);
                });
                // sort list by favorite 
                this.sortByFav();
            })
            .catch((error) => {
                // FUTURE: better error handling
                console.log(error);
            });
        }, 500),
        sortByFav: function(teamName = this.favTeam) {
            // this method is used to sort a list of games by a favorite team. default team is set in data object. two parameters: one for a team and one for the unmanipulated list of games
            // find game objects that contain a home_team or away_team equal to fav team name, then spread rest of the array that don't contain fav team after it
            var sorted = [ _.find(this.games, function(g) { return g.home_team_name == teamName || g.away_team_name == teamName; }), ...(_.filter(this.games, function(data) { return data.home_team_name != teamName && data.away_team_name != teamName; }))];
            // if any undefined present in the sorted list, set to blank, else store games as the sorted list
            this.games = sorted.includes(undefined) ? [] : sorted;
        },
        dateSlide: function(slide) {
            this.selectedDate = (slide=='asc') ? moment(this.receivedDate).add(1,'days')._d : moment(this.receivedDate).subtract(1,'days')._d;
        }
    }
}
</script>

<style scoped>
/* Kept styles as close to name conventions as possible. Could be incredibly more modular with PostCSS @apply and :root */
a {
  color: #000;
  text-decoration: none;
}
.container.games {
    grid-area: data;
    align-self: stretch;
    padding: 1rem;
}
.date {
    display: flex;
    flex-direction: column;
    justify-content: center;
}
.current_date {
    font-size: 2rem;
    font-weight: bold;
    margin: 5px 0px;
}
.datepicker {
    align-self: center;
    margin: 10px;
}
.table_games {
    width: 100%;
}
.table_none {
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