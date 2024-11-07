const shell = require("shelljs");

const ms = 1000

shell.config.silent = true;
if (!shell.which("amixer")) {
    shell.echo("Sorry, this script requires amixer\nConsider installing:\nsudo apt-get install alsa-utils");
    shell.exit(1);
}
const useMixer = (cb) => {
    let state = {}
    let timer
    const action = (state) => {
        shell.exec(`amixer -c 0 set Master ${state.volume}%`)
        state = {}
    }
    const query = () => {
        return {
            volume: shell.exec("amixer sget Master | grep 'Right:' | awk -F'[][]' '{ print $2 }' | sed 's/[^0-9]//g'").stdout.trim()
        }
    }
    const run = () => {
        const s = query()
        if (state.volume !== s.volume) {
            state.volume = s.volume
            cb(state)
        }
        timer = setTimeout(run, ms)
    }
    const end = () => {
        clearTimeout(timer)
    }
    return {
        run,
        action,
        query,
        end,
    }
}

module.exports = useMixer
