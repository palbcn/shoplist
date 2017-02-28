call nodepath
start "nodemon shoplist server 60784" nodemon --ignore client server 
start "browser-sync shoplist chrome" browser-sync start --proxy localhost:60784 --browser chrome --files client --no-notify