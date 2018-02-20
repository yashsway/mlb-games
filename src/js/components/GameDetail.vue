<template>
  <div class="container detail">
    <div class="main">
        <!-- use computed prop here for date -->
        <div class="section game_details">
            <span class="game_day" v-if="readableDate!==undefined">{{ readableDate }}</span>
            <span class="game_location" v-if="this.gameLocation!==undefined && this.gameLocation!==null"><span class="pipe">|</span>{{ this.gameLocation }}</span>
            <span class="game_venue" v-if="this.gameVenue!==undefined && this.gameVenue!==null"><span class="pipe">|</span>{{ this.gameVenue }}</span>
        </div>
        <!-- short circuit and don't show unless data exists -->
        <div class="section innings_section" v-if="Array.isArray(linescore) && linescore.length>1">
            <h3>Linescore</h3>
            <table class="innings_table">
                <!-- key needed for rendered tags so vue can update correctly -->
                <thead>
                    <tr>
                        <th>Team</th>
                        <th v-for="inn in linescore" v-bind:key="inn.inning">{{ inn.inning }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{{ home.code.toUpperCase() }}</td>
                        <td v-for="inn in linescore" v-bind:key="inn.inning+inn.home">{{ inn.home }}</td>
                    </tr>
                    <tr>
                        <td>{{ away.code.toUpperCase() }}</td>
                        <td v-for="inn in linescore" v-bind:key="inn.inning+inn.away">{{ inn.away }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <!-- winning / losing pitcher and home runs -->
        <div class="section players_section" v-if="homerunData!==null || this.losing_pitcher!==null || this.winning_pitcher!==null">
            <h3>Highlights</h3>
            <div class="winning_pitcher" v-if="this.winning_pitcher!==null">
                <span class="player_label">Winning Pitcher:</span>
                <span class="player_number">{{ this.winning_pitcher.number }}</span>
                <span class="player_name">{{ `${this.winning_pitcher.last} ${this.winning_pitcher.first}` }}</span>
            </div>
            <div class="pitcher" v-if="this.losing_pitcher!==null">
                <span class="player_label">Losing Pitcher:</span>
                <span class="player_number">{{ this.losing_pitcher.number }}</span>
                <span class="player_name">{{ `${this.losing_pitcher.last} ${this.losing_pitcher.first}` }}</span>
            </div>
            <div class="home_runs" v-if="homerunData!==null && homerunData.length>=1">
                <span class="player_label">Home Runs:</span>
                <el-table :data="homerunData" class="homerun_table">
                    <el-table-column label="Name" align="center" width="150">
                        <template slot-scope="props">
                            <p>{{ `${props.row.name_display_roster} (${props.row.team_code.toUpperCase()})` }}</p>
                        </template>
                    </el-table-column>
                    <!-- dynamically populates based on stats defined -->
                    <el-table-column :label="stat.toUpperCase()" :align="'center'" v-for="stat in homerun_stats" :key="stat">
                        <template slot-scope="props">
                            <p>{{ props.row[stat] }}</p>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
        <!-- short circuit and don't show unless data exists -->
        <div class="section batters_section" v-if="this.batters.length!==0">
            <h3>Batters</h3>
            <div class="game_teams">
                <!-- bold buttons based on which team is being shown -->
                <div class="toggle home_stats" v-on:click="home_default=!home_default"><span :class="home_default ? 'bold' : 'no_bold'">{{ home.name }}</span></div>
                <span class="pipe">|</span>
                <div class="toggle away_stats" v-on:click="home_default=!home_default"><span :class="!home_default ? 'bold' : 'no_bold'">{{ away.name }}</span></div>
            </div>
            <div class="game_batters">
                <!-- show if home is default. statistics to show are dynamic and set in component data. -->
                <el-table :data="batters.home.batter" class="batters_table" v-show="home_default">
                    <el-table-column label="Name" align="center" width="150">
                        <template slot-scope="props">
                            <p>{{ props.row.name }}</p>
                        </template>
                    </el-table-column>
                    <el-table-column :label="stat.toUpperCase()" :align="'center'" v-for="stat in batter_stats" :key="stat">
                        <template slot-scope="props">
                            <p>{{ props.row[stat] }}</p>
                        </template>
                    </el-table-column>
                </el-table>
                <!-- statistics to choose are dynamic and set in the component data. iterates and makes appr # of columns. don't show if home default is true -->
                <el-table :data="batters.away.batter" class="batters_table" v-show="!home_default">
                    <el-table-column label="Name" align="center" width="150">
                        <template slot-scope="props">
                            <p>{{ props.row.name }}</p>
                        </template>
                    </el-table-column>
                    <el-table-column :label="stat.toUpperCase()" :align="'center'" v-for="stat in batter_stats" :key="stat">
                        <template slot-scope="props">
                            <p>{{ props.row[stat] }}</p>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
        <!-- show if still loading, layout image in the future? -->
        <div class="no_data" v-show="!updated">Loading...</div>
        <!-- shortcircuit and don't show if no data available -->
        <div class="no_data" v-if="updated && (this.linescore.length===0 || this.gameDate===undefined)">
            <p v-if="this.linescore.length===0">No data provided by MLB yet!</p>
            <p v-if="this.gameDate===undefined">No date provided. Please navigate back to the game listing and view details again.</p>
        </div>
        <!-- go back to the previous list view with the exact date that was originally passed -->
        <el-button class="back_to_list" type="info"><router-link :to="{ name: 'game_list', query: { gameDate: this.gameDate }}">Back</router-link></el-button>
    </div>
    
  </div>
</template>

<script>
import axios from 'axios';
import moment from 'moment';
import _ from 'lodash';

export default {
    // FUTURE: keep some props that have been passed from other view in localstorage so it's accessible on refresh
    props: {
        location: {
            type: String
        },
        venue: {
            type: String
        },
        winning_pitcher: {
            type: Object,
            default: null
        },
        losing_pitcher: {
            type: Object,
            default: null
        },
        home_runs: {
            type: Object,
            default: null
        }
    },
    name: 'game_detail',
    beforeMount: function() {
        // get data with the URL provided in the query from the previous list view
        this.getData();
    },
    data() {
        return {
            // if not for inconsistencies in the MLB api, specifically related to formatting of dates, wouldn't have to pass gameDay in the query
            gameDate: this.$route.query.gameDate,
            gameLocation: '',
            gameVenue: '',
            gameURL: '',
            home: { 'code': '-' },
            away: { 'code': '-' },
            linescore: [],
            batters: [],
            batter_stats: ['ab','r','h','rbi','bb','so','avg'],
            homerun_stats: ['inning','runners','hr','std_hr'],
            home_default: true,
            updated: false
        }
    },
    computed: {
        // human readable date set at start, no recalcs reqd.
        readableDate: function() {
            return moment(this.$route.query.gameDate).format('ddd MMM DD YYYY');
        },
        homerunData: function() {
            if (this.home_runs!==null) {
                return Array.isArray(this.home_runs.player) ? [...this.home_runs.player] : [this.home_runs.player];
            } else {
                return null;
            }
        }
    },
    methods: {
        // relevant ops to update UI as needed go here
        updateUI: function() {
            this.updated = true;
        },
        // set data from the MLB api for the current game
        setDetails: function(gameURL) {
            // interpolate gameURL into API string
            axios.get(`https://gd2.mlb.com${gameURL}/boxscore.json`)
            .then((response) => {
                // set once
                var mlbData = response.data.data.boxscore;
                // set home and away name + code
                this.home = {'name':mlbData.home_fname,'code':mlbData.home_team_code};
                this.away = {'name':mlbData.away_fname,'code':mlbData.away_team_code};
                // find and set innings
                this.linescore = mlbData.linescore.inning_line_score;
                // find and set batter statistics. keep individual batter statisitics only for home and away. store in separate keys.
                var homeBatters = _.pick(_.filter(mlbData.batting, { 'team_flag': 'home' })[0],['batter']);
                var awayBatters = _.pick(_.filter(mlbData.batting, { 'team_flag': 'away' })[0],['batter']);
                this.batters = {'home': homeBatters, 'away': awayBatters };
                // update UI
                this.updateUI();
            })
            .catch((error) => {
                console.log(error);
                // update UI
                this.updateUI();
            });
        },
        // if URL not provided, get data from scoreboard based on date, filter the correct game based on the route param gameID and then get the URL from there
        getData: function(gameDate = this.$route.query.gameDate) {
            // get data that is missing, specifically the URL without which we cannot get detail data
            if (gameDate!==undefined) {
                var day = moment(gameDate);
                axios.get(`https://gd2.mlb.com/components/game/mlb/year_${day.format('YYYY')}/month_${day.format('MM')}/day_${day.format('DD')}/master_scoreboard.json`)
                .then((response) => {
                    // filter can't be performed on objects
                    var currentGame =  Array.isArray(response.data.data.games.game) ? _.filter([...response.data.data.games.game],{ 'game_pk': this.$route.params.gameID })[0] : _.filter([response.data.data.games.game],{ 'game_pk': this.$route.params.gameID })[0];
                    // if something found
                    if (currentGame!==undefined && currentGame.length!==0) {
                        // set game URL
                        this.gameURL = currentGame.game_data_directory;
                        // set location and venue
                        this.gameLocation = currentGame.location;
                        this.gameVenue = currentGame.venue;
                        // now we can set details based on the acquired url
                        this.setDetails(this.gameURL);
                    } else {
                        // if nothing found for some strange reason where gameID isn't in this set of games
                        // TODO: better error handling here
                        this.updateUI()
                    }
                })
                .catch((error) => {
                    console.log(error);
                    // update UI
                    this.updateUI();
                });
            } else {
                // UI catches error, nothing else to do here.
            }
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
.container.detail {
    grid-area: data;
    align-self: stretch;
    padding: 1rem;
}
.innings_table {
    margin: 0 auto;
}
.innings_table tbody td {
    padding: 3px;
}
.innings_table thead th {
    padding: 3px;
}
.game_teams {
    margin: 1rem 0rem;
}
.toggle {
    margin: 0rem 1rem;
    display: inline-block;
    cursor: pointer;
}
.pipe {
    margin: 0rem 1.5rem;
}
.bold {
    font-weight: bold;
}
.no-bold {
    font-weight: normal;
}
.game_details {
    font-size: 1.5rem;
    & > * {
        display: inline-block;
    }
}
.section {
    margin: 20px 0px;
}
.no_data {
    color: #909399;
    font-size: 2rem;
    padding: 20px;
    height: 30vh;
    display: flex;
    justify-content: center;
    align-items: center;
}
.back_to_list {
    margin: 1.5rem 0rem;
}
</style>