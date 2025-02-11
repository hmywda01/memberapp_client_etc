//All functions that generate HTML should be quarantined here. 

//All HTML to be escaped should go through functions in this file
//variables ending in HTML should already be HTML escaped
//functions ending in HTML should return safely escaped HTML strings


//Functions
//san is used to strip all but alphanumeric (sanitizealphanumeric)
//ds is used to escape as HTML
//Number is used to ensure an input is a number
//encodeURIComponent for part of uri
//unicodeEscape to escape text going into function

"use strict";


//Members

//Get html for a user, given their address and name
function userHTML(address, name, ratingID, ratingRawScore, ratingStarSize, pagingid, publickey, picurl, tokens, followers, following, blockers, blocking, profile, isfollowing, nametime, includeProfile, lastactive, sysrating) {
    if (!address) {
        return "error:no address for user";
    }
    if (name == "" || name == null) {
        name = address.substring(0, 10);
    }

    var userclass = "hnuser";
    var profilemeta = "profile-meta";
    var curTime = new Date().getTime() / 1000;

    if (!nametime || curTime - nametime < 60 * 60 * 24 * 7 * 2) {
        //if the user has changed name in the past two weeks
        userclass = "hnuser newuser";
        profilemeta = "profile-meta newuser";
    }

    var memberpic = `<svg class="jdenticon" width="20" height="20" data-jdenticon-value="` + san(address) + `"></svg>`;
    if (picurl) {
        var picurlfull = getPicURL(picurl,profilepicbase,address);
        memberpic = `<img class="memberpicturesmall" src='` + picurlfull + `'/>`;    
    }

    var linkStart = `<a href="#member?qaddress=` + san(address) + `" onclick="nlc();" class="` + userclass + `">`;
    var linkEnd = `</a> `;
    var flair = " ";
    if (tokens > 0) {
        flair = ` <span data-vavilon_title="VV0148" class="flair" title="Top MEMBER Token Holder">` + ordinal_suffix_of(Number(tokens)) + ` </span> `;
    }
    /*var ret = `<span class="memberfilter"><span id="memberinfo` + ratingID + `">` + linkStart + memberpic
        + `<span class="member-handle">` + ds(name) + `</span>` + linkEnd + `</span>` + flair;
    var ratingHTML = `<div class="starrating"><div data-ratingsize="` + Number(ratingStarSize) + `" data-ratingaddress="` + san(address) + `" data-ratingraw="` + Number(ratingRawScore) + `" id="rating` + ratingID + `"></div></div>`;
    if (ratingStarSize > 0) {
        ret += ratingHTML;
    }*/
    var followButton = `<a data-vavilon="follow" class="follow" href="javascript:;" onclick="follow('` + unicodeEscape(address) + `','` + unicodeEscape(publickey) + `'); this.style.display='none';">follow</a>`;
    if (isfollowing) {
        followButton = `<a data-vavilon="unfollow" class="unfollow" href="javascript:;" onclick="unfollow('` + unicodeEscape(address) + `','` + unicodeEscape(publickey) + `'); this.style.display='none';">unfollow</a>`;
    }

    if (ratingID == undefined) {
        ratingID = 'test';
    }

    var onlineStatus="";
    //var lastonlineseconds=curTime - lastactive;
    onlineStatus=timeSince(lastactive,true);
    /*if (lastactive &&  lastonlineseconds < 60 * 10) {
        //if the user took an action in the past 3 minutes
        onlineStatus="🟠";
    }
    if (lastactive && lastonlineseconds < 60 * 3) {
        //if the user took an action in the past 3 minutes
        onlineStatus="🟢";
    }*/

    var directlink="";

    var systemScoreClass='';
    if(!ratingRawScore){
        ratingRawScore=sysrating;
        systemScoreClass='systemscore';
    }

    var obj = {
        //These must all be HTML safe.
        address: san(address),
        profilepicsmall: memberpic,
        handle: ds(name),
        pagingidattrib: ds(pagingid),
        pagingid: ds(pagingid),
        flair: flair,
        rating: Number(ratingRawScore),
        followbutton: followButton,
        following: Number(following),
        followers: Number(followers),
        profile: getSafeInteractiveHTML(profile, 'profilecard', false),
        diff: ratingID,
        onlinestatus: onlineStatus,
        systemscoreclass:systemScoreClass,       
        directlink:directlink
    }

        obj.profilecard="";
        if(includeProfile){
            obj.authorsidebar="";
            obj.profilecard=templateReplace(userProfileCompactTemplate, obj);
        }
        return templateReplace(userCompactTemplate, obj);


}

function userFromDataBasic(data, mainRatingID, size) {
    if(!data.raterrating){data.raterrating=data.rating;}//Fix for collapsed comments not having rating. TODO - look into rating/raterrating
    return userHTML(data.address, data.name, mainRatingID, data.raterrating, size, data.pagingid, data.publickey, data.picurl, data.tokens, data.followers, data.following, data.blockers, data.blocking, data.profile, data.isfollowing, data.nametime, true, data.lastactive, data.sysrating);
}

//Posts and Replies
function getReplyDiv(txid, page, differentiator,address,picurl) {
    page = page + differentiator;

    

    var obj = {
        //These must all be HTML safe.
        page: page,
        txid: san(txid),
        address: address,
        profilepicsmall:profilepic,
        address:pubkey
    }

    return templateReplace(replyDivTemplate, obj);

}

function getReplyAndTipLinksHTML(page, txid, address, article, geohash, differentiator, topicHOSTILE, repostcount, repostidtxid, sourcenetwork) {

    var page = page + differentiator; //This is so if the same post appears twice on the same page, there is a way to tell it apart
    var santxid = san(txid);
    var articleLink2 = "";
    var mapLink = " ";

    var permalink = `?` + santxid.substring(0, 4) + `#thread?post=` + santxid.substring(0, 10);
    var articlelink = `?` + santxid.substring(0, 4) + `#article?post=` + santxid.substring(0, 10);

    if (pathpermalinks) {
        permalink = pathpermalinks + `p/` + santxid.substring(0, 10);
        articlelink = pathpermalinks + `a/` + santxid.substring(0, 10);
    }

    if (article) {
        articleLink2 = `<a id="articlelink` + page + santxid + `" href="` + articlelink + `">article</a> `;
    }
    if (geohash != null && geohash != "") {
        mapLink = ` <a id="maplink` + page + santxid + `" href="#map?geohash=` + san(geohash) + `&post=` + santxid + `">🌍map</a> `;
    }
    var hideuserHTML = hideuserHTML = `<a data-vavilon="flaguser" id="hideuserlink` + page + santxid + `" onclick="hideuser('` + san(address) + `','','hideuserlink` + page + santxid + `');" href="javascript:;">flag(user)</a>`;
    if (topicHOSTILE != "") {
        hideuserHTML += `<a data-vavilon="flagusertopic" id="hideuserlink` + page + santxid + `" onclick="hideuser('` + san(address) + `','` + unicodeEscape(topicHOSTILE) + `','hideuserlink` + page + santxid + `');" href="javascript:;">flag(user for topic)</a>`;
    }

    //Can remove mispelling 'remebers' when css files are updated
    var remembersActive = "remebersactive remembersactive";
    var remembersOnclick = ` onclick="repostPost('` + santxid + `'); this.class='remebersinactive remembersinactive'; this.onclick='';" href="javascript:;"`;
    if (repostidtxid != null && repostidtxid != '') {
        remembersActive = "remebersinactive remembersinactive";
        remembersOnclick = ` `;
    }

    let sourceNetworkHTML='<a rel="noopener noreferrer" target="bitclout" href="https://bitclout.com/posts/"'+san(txid)+'>BitClout</a>';
    if(sourcenetwork==0){
        sourceNetworkHTML='<a rel="noopener noreferrer" target="memo" href="https://memo.cash/a/"'+san(txid)+'>Memo</a>';
    }

    var obj = {
        //These must all be HTML safe.
        page: page,
        txid: san(txid),
        remembersonclick: remembersOnclick,
        diff: differentiator,
        repostcount: repostcount,
        remembersactive: remembersActive,
        articlelink2: articleLink2,
        hideuser: hideuserHTML,
        address: san(address),
        permalink: permalink,
        maplink: mapLink,
        sourceNetworkHTML:sourceNetworkHTML
    }

    return templateReplace(replyAndTipsTemplate, obj);


    /*
        return mapLink +
            `<a id="replylink` + santxid + page + `" onclick="showReplyBox('` + santxid + page + `');" href="javascript:;"> ` + getSafeTranslation('reply') + `</a>
            <span class="rememberscounttext"><a class="`+ remembersActive + `" id="repostlink` + page + santxid + `" ` + remembersOnclick + `> 
            <span onclick="showRemembersExpanded('` + santxid + `','remembersexpanded` + santxid + differentiator + `')" class="repostscount" id="repostscount` + santxid + `"> ` + Number(repostcount) + " " + getSafeTranslation('remembers') + "</span>" + `</a></span>
            <a id="tiplink`+ page + santxid + `" onclick="showTipBox('` + page + santxid + `');" href="javascript:;">tip</a>
            <a id="quotelink`+ page + santxid + `" href="#new?txid=` + santxid + `">quote</a>
            <a id="morelink`+ page + santxid + `" onclick="showMore('more` + page + santxid + `','morelink` + page + santxid + `');" href="javascript:;">+more</a>
            <span id="more`+ page + santxid + `" style="display:none">
                <a class="permalink" id="permalink`+ page + santxid + `" href="` + permalink + `">permalink</a> `
            + articleLink2 + `
                <a rel="noopener noreferrer" target="memo" href="https://memo.cash/a/` + santxid + `">memo</a>
                <a rel="noopener noreferrer" target="bitcoincom" href="https://explorer.bitcoin.com/bch/tx/` + santxid + `">bitcoin.com</a>
                <a rel="noopener noreferrer" target="blockchair" href="https://blockchair.com/bitcoin-cash/transaction/` + santxid + `">blockchair</a>
                <a rel="noopener noreferrer" target="btccom" href="https://bch.btc.com/` + santxid + `">btc.com</a>
                <a rel="noopener noreferrer" target="bitcoinunlimited" href="https://explorer.bitcoinunlimited.info/tx/` + santxid + `">bitcoin unlimited</a>
                <a id="hidepostlink`+ page + santxid + `" onclick="sendHidePost('` + santxid + `');" href="javascript:;">flag(post)</a>`
            + hideuserHTML +
            `</span>
    
            <span id="tipbox`+ page + santxid + `" style="display:none">
                <input id="tipamount`+ page + santxid + `" type="number" value="0" min="0" style="width: 6em;" step="1000"/>
                <input id="tipbutton`+ page + santxid + `" value="tip" type="submit" onclick="sendTip('` + santxid + `','` + san(address) + `','` + page + `');"/>
                <input id="tipstatus`+ page + santxid + `"value="sending" type="submit" style="display:none" disabled/>
            </span>`;*/
}

function getScoresHTML(txid, likes, dislikes, tips, differentiator) {

    var obj = {
        //These must all be HTML safe.
        txid: san(txid),
        diff: differentiator,
        likesbalance: (Number(likes) - Number(dislikes)),
        tips: Number(tips),
        balancestring: balanceString(Number(tips), false)
    }
    return templateReplace(scoresTemplate, obj);
    //return ` <span onclick="showScoresExpanded('` + san(txid) + `','scoresexpanded` + san(txid) + differentiator + `')" id="scores` + san(txid) + differentiator + `" class="score"><span class="likescounttext"><span id="likescount` + san(txid) + `">` + (Number(likes) - Number(dislikes)) + `</span> likes and</span> <span class="tipscounttext"><span id="tipscount` + san(txid) + `"  data-amount="` + Number(tips) + `">` + balanceString(Number(tips), false) + `</span></span></span>`;
}

function replacePageNamesWithLinks(target){
    return target.replace(/(^|\s|>)@([^.,\/#!$%\^&\*;:{}=\-`~()'"@<>\ \n?]{1,217})/g, replacePageName);
}

function replacePageName(match, p1, p2, offset, string) {
    // p1 is nondigits, p2 digits, and p3 non-alphanumerics
    return p1 + `<a href="#member?pagingid=` + encodeURIComponent(p2) + `" onclick="nlc();">@` + ds(p2) + `</a>`;
}

function replaceTagNamesWithLinks(target){
    return target.replace(/(^|\s|>)#([^.,\/#!$%\^&\*;:{}=\-`~()'"@<>\ \n?]{1,217})/g, replaceTagName);
}

function replaceTagName(match, p1, p2, offset, string) {
    // p1 is nondigits, p2 digits, and p3 non-alphanumerics
    return p1 + `<a href="#topic?topicname=` + encodeURIComponent(p2) + `" onclick="nlc();">#` + ds(p2) + `</a>`;
}

function replaceTickerNamesWithLinks(target){
    return target.replace(/(^|\s|>)$([^.,\/#!$%\^&\*;:{}=\-`~()'"@<>\ \n?]{1,217})/g, replaceTickerName);
}

function replaceTickerName(match, p1, p2, offset, string) {
    // p1 is nondigits, p2 digits, and p3 non-alphanumerics
    return p1 + `<a href="#member?pagingid=` + encodeURIComponent(p2) + `" onclick="nlc();">$` + ds(p2) + `</a>`;
}


function getSafeInteractiveHTML(message, differentiator, includeMajorMedia){
    //Escape as HTML
    let messageHTML = ds(message);
    //Add Line breaks
    messageHTML = messageHTML.replace(/(?:\r\n|\r|\n)/g, '<br>');

    //Add tag links
    messageHTML = replaceTagNamesWithLinks(messageHTML);
    
    //Add ticker links
    messageHTML = replaceTickerNamesWithLinks(messageHTML);
    
    //Add paging id links
    messageHTML = replacePageNamesWithLinks(messageHTML);
    
    //Add links for web addresses
    messageHTML = anchorme(messageHTML, { attributes: [{ name: "target", value: "_blank" }] });

    //Scan for XSS vulnerabilities
    messageHTML = DOMPurify.sanitize(messageHTML);

    //Add youtube etc
    if(includeMajorMedia){
        messageHTML = addImageAndYoutubeMarkdown(messageHTML, differentiator, false);
    }

    return messageHTML;
}

function getHTMLForPostHTML(txid, address, name, likes, dislikes, tips, firstseen, message, roottxid, topic, replies, geohash, page, ratingID, likedtxid, likeordislike, repliesroot, rating, differentiator, repostcount, repostidtxid, pagingid, publickey, picurl, tokens, followers, following, blockers, blocking, profile, isfollowing, nametime, repostedHTML, lastactive, truncate, sysrating, sourcenetwork) {

    if (!address) { updateStatus('Missing address for post error - this should not happen.'); return ""; }
    if (!name) { name = address.substring(0, 10); }
    
    if(truncate && message.length>400){ //to do, try to break on a whitespace
        message=message.substring(0,200)+'...';
    }

    let messageLinksHTML = getSafeInteractiveHTML(message, differentiator, true);

    
    repliesroot = Number(repliesroot);
    replies = Number(replies);
    var isReply = (roottxid != txid);
    if (!isReply) {
        //only if main post
        if (repliesroot > replies) {
            replies = repliesroot;
        }
    }

    var theAuthorHTML = userHTML(address, name, ratingID, rating, 8, pagingid, publickey, picurl, tokens, followers, following, blockers, blocking, profile, isfollowing, nametime, true, lastactive, sysrating);
    var theAuthor2HTML = userHTML(address, name, ratingID, rating, 8, pagingid, publickey, picurl, tokens, followers, following, blockers, blocking, profile, isfollowing, nametime, false, lastactive, sysrating);
    
    var votelinks = getVoteButtons(txid, address, likedtxid, likeordislike, (Number(likes) - Number(dislikes)));
    var age = getAgeHTML(firstseen);
    var scores = getScoresHTML(txid, likes, dislikes, tips, differentiator);
    var tipsandlinks = getReplyAndTipLinksHTML(page, txid, address, true, geohash, differentiator, topic, repostcount, repostidtxid, sourcenetwork);
    var replydiv = getReplyDiv(txid, page, differentiator,address,picurl);

    var santxid=san(txid);
    var permalink = `p/` + santxid.substring(0, 10);
    var articlelink = `a/` + santxid.substring(0, 10);
    if (pathpermalinks) {
        permalink = pathpermalinks + `p/` + santxid.substring(0, 10);
        articlelink = pathpermalinks + `a/` + santxid.substring(0, 10);
    }

    var directlink="";
    let sourceNetworkHTML='<a rel="noopener noreferrer" target="bitclout" href="https://bitclout.com/posts/'+san(txid)+'">BitClout</a>';
    if(sourcenetwork==0){
        sourceNetworkHTML='<a rel="noopener noreferrer" target="memo" href="https://memo.cash/a/'+san(txid)+'">Memo</a>';
    }
    var obj = {
        //These must all be HTML safe 
        author: theAuthorHTML,
        authorsidebar: theAuthor2HTML,
        message: messageLinksHTML,
        replies: Number(replies)<0?0:Number(replies),
        likesbalance: (Number(likes) - Number(dislikes)),
        likes: Number(likes),
        dislikes: Number(dislikes),
        remembers: Number(repostcount),
        tips: balanceString(Number(tips), true),
        tipsinsatoshis:Number(tips),
        txid: san(txid),
        txidshort:san(txid).substring(0, 10),
        elapsed: getAgeHTML(firstseen, false),
        elapsedcompressed: getAgeHTML(firstseen, true),
        topic: topic ? getTopicHTML(topic, getSafeTranslation('totopic', ' #')) : "",
        topicescaped: unicodeEscape(topic),
        quote: repostedHTML,
        address: address,
        votelinks: votelinks,
        age: age,
        roottxid: roottxid,
        scores: scores,
        tipsandlinks: tipsandlinks,
        replydiv: replydiv,
        diff: differentiator,
        likeactivated:likeordislike == "1"?"-activated":"",
        dislikeactivated:likeordislike == "-1"?"-activated":"",
        rememberactivated:repostidtxid?"-activated":"",
        permalink:permalink,
        articlelink:articlelink,
        directlink:directlink,
        sourceNetworkHTML:sourceNetworkHTML
    };

    /*var retVal = `<div class="post">
                <div class="votelinks">` + votelinks + `</div>
                <div class="postdetails">
                    <div class="title"><p>`+ messageLinksHTML + `</p></div>`
        + repostedHTML
        + `<div class="subtext">
                        <span class="submitter"> 
                        <span class="plaintext">submitted</span> `
        + ` ` + age
        + ` <span class="plaintext">` + getSafeTranslation('by') + `</span> `
        + theAuthorHTML
        + getTopicHTML(topic, 'to topic/')
        + `</span>
            <span class="subtextbuttons">`
        + `<a href="#thread?root=` + san(roottxid) + `&post=` + san(txid) + `" onclick="nlc();">` + (Math.max(0, Number(replies))) + `&nbsp;`
        + getSafeTranslation('comments').toLowerCase()
        + `</a> `
        + scores
        + ` `
        + tipsandlinks +
        `</span></div>
        <div id="scoresexpanded`+ san(txid) + differentiator + `" class="scoreexpanded"></div>
        <div id="remembersexpanded`+ san(txid) + differentiator + `" class="remembersexpanded"></div>`
        + replydiv + `
                </div>
            </div>`;
        return retVal;        
        */

        return templateReplace(postCompactTemplate, obj);


}


function getHTMLForReplyHTML(txid, address, name, likes, dislikes, tips, firstseen, message, depth, page, ratingID, highlighttxid, likedtxid, likeordislike, blockstxid, rating, differentiator, topicHOSTILE, moderatedtxid, repostcount, repostidtxid, pagingid, publickey, picurl, tokens, followers, following, blockers, blocking, profile, isfollowing, nametime, lastactive, sysrating, sourcenetwork) {
    if (name == null) { name = address.substring(0, 10); }
    //Remove html - use dslite here to allow for markdown including some characters
    message = dslite(message);

    //add images and youtube markdown
    //message=addImageAndYoutubeMarkdown(message);
    //add markdown
    message = ShowdownConverter.makeHtml(message);
    //message=SnuOwnd.getParser().render(message);

    //message = anchorme(message, { attributes: [{ name: "target", value: "_blank" }] });

    //check for XSS vulnerabilities
    message = DOMPurify.sanitize(message);

    //Add youtube links

    message = addImageAndYoutubeMarkdown(message, differentiator, true);

    var voteButtons = getVoteButtons(txid, address, likedtxid, likeordislike, (Number(likes) - Number(dislikes)));
    var author = userHTML(address, name, ratingID, rating, 8, pagingid, publickey, picurl, tokens, followers, following, blockers, blocking, profile, isfollowing, nametime, true, lastactive, sysrating);
    var scores = getScoresHTML(txid, likes, dislikes, tips, differentiator);
    var age = getAgeHTML(firstseen);
    var replyAndTips = getReplyAndTipLinksHTML(page, txid, address, false, "", differentiator, topicHOSTILE, repostcount, repostidtxid, sourcenetwork);
    var replyDiv = getReplyDiv(txid, page, differentiator,address,picurl);


    var obj = {
        //These must all be HTML safe 
        txid: san(txid),
        highlighted: (txid.startsWith(highlighttxid) ? ` highlight` : ``),
        id: (txid.startsWith(highlighttxid) ? `highlightedcomment` : ``),
        blocked: (blockstxid != null || moderatedtxid != null ? `blocked` : ``),
        votebuttons: voteButtons,
        author: author,
        message: message,
        scores: scores,
        age: age,
        replyandtips: replyAndTips,
        replydiv: replyDiv,
        diff: differentiator
    };

        return templateReplace(replyTemplate, obj);

    /*return `<div ` + (txid.startsWith(highlighttxid) ? `class="reply highlight" id="highlightedcomment"` : `class="reply"`) + `>
                <div`+ (blockstxid != null || moderatedtxid != null ? ` class="blocked"` : ``) + `>
                    <div class="votelinks">` + voteButtons + `</div>
                    <div class="commentdetails">
                        <div class="comhead"> <a onclick="collapseComment('`+ san(txid) + `');" href="javascript:;">[-]</a> `
        + author
        + `</div>
                        <div class="comment"><div class="commentbody">
                            `+ message + `
                            </div><div class="subtextbuttons">`+ scores
        + ` ` + age + ` ` + replyAndTips + `</div>
                            `+ replyDiv + `
                        </div>
                        <div id="scoresexpanded`+ san(txid) + differentiator + `" class="scoreexpanded"></div>
                        <div id="remembersexpanded`+ san(txid) + differentiator + `" class="remembersexpanded"></div>
                    </div>
                </div>
            </div>
            `;*/
}

function getNestedPostHTML(data, targettxid, depth, pageName, highlighttxid, firstreplytxid) {
    var contents = "<ul>";
    for (var i = 0; i < data.length; i++) {
        if ((data[i].retxid == targettxid || data[i].retxid == firstreplytxid) && data[i].txid != firstreplytxid) {
            let ratingused=data[i].sysrating;
            if(data[i].rating){
                ratingused=data[i].rating;
            }
            var isMuted = (data[i].blockstxid != null || data[i].moderated != null);

            var obj = {
                unmuteddisplay: (isMuted ? `none` : `block`),
                muteddisplay: (isMuted ? `block` : `none`),
                txid: san(data[i].txid),
                hightlightedclass: (data[i].txid.startsWith(highlighttxid) ? `highlightli` : ``),
                replyHTML: getHTMLForReply(data[i], depth, pageName, i, highlighttxid),
                nestedPostHTML: getNestedPostHTML(data, data[i].txid, depth + 1, pageName, highlighttxid, "dontmatch"),
                user: userFromDataBasic(data[i], data[i].ratingID, 0),
                scores: getScoresHTML(data[i].txid, data[i].likes, data[i].dislikes, data[i].tips, i),
                age: getAgeHTML(data[i].firstseen),
                diff: i
                //These must all be HTML safe.
            }

            contents += templateReplace(nestedPostTemplate, obj);
            /*
            contents += `<li style="display:` + (isMuted ? `none` : `block`) + `" id="LI` + san(data[i].txid) + `"` + (data[i].txid.startsWith(highlighttxid) ? `" class="highlightli" ` : ``) + `>` + getHTMLForReply(data[i], depth, pageName, i, highlighttxid) + getNestedPostHTML(data, data[i].txid, depth + 1, pageName, highlighttxid, "dontmatch") + "</li>";
            contents += `<li style="display:` + (isMuted ? `block` : `none`) + `" id="CollapsedLI` + san(data[i].txid) + `" class="collapsed"><div class="comhead"><a onclick="uncollapseComment('` + san(data[i].txid) + `');" href="javascript:;">[+] </a>`
                + userFromDataBasic(data[i], data[i].ratingID, 0)
                + getScoresHTML(data[i].txid, data[i].likes, data[i].dislikes, data[i].tips, i)
                + ` ` + getAgeHTML(data[i].firstseen)
                + `</div><div id="scoresexpanded` + san(data[i].txid) + i + `" class="scoreexpanded"></div>
                <div id="remembersexpanded` + san(data[i].txid) + i + `" class="remembersexpanded"></div></li>`;*/
        }
    }
    contents = contents + "</ul>";
    return contents;
}

function getAgeHTML(firstseen, compress) {
    return `<span class="age">` + timeSince(Number(firstseen), compress) + `</span>`;
}

function getPostListItemHTML(postHTML) {
    if (postHTML == "") {
        return "";
    }
    return `<li class="post-list-li">` + postHTML + `</li>`;
}

function postlinkHTML(txid, linktext) {
    return `<a href="#thread?post=` + san(txid) + `" onclick="nlc();">` + getSafeTranslation(linktext,linktext) + `</a>`;
}

function getNavHeaderHTML(order, content, topicnameHOSTILE, filter, start, limit, action, qaddress, functionName, numberOfResults) {
    //Caution topicname may contain hostile characters/code

    var navheader = `<nav class="filters">`;
    navheader += `<a data-vavilon="VV0106" data-vavilon_title="VV0107" value="new" title="Latest posts" class="`+(order=='new'?'filteron':'filteroff')+`" href="#` + action + `?start=0&limit=` + limit + `&order=new&content=` + content + `&filter=` + filter + `&qaddress=` + qaddress + `&topicname=` + ds(encodeURIComponent(topicnameHOSTILE)) + `" >New</a> `;
    navheader += `<span class="separator"></span>`;
    navheader += `<a data-vavilon="VV0104" data-vavilon_title="VV0105" value="hot" title="Hottest posts from the past 48 Hours" class="`+(order=='hot'?'filteron':'filteroff')+`" href="#` + action + `?start=0&limit=` + limit + `&order=hot&content=` + content + `&filter=` + filter + `&qaddress=` + qaddress + `&topicname=` + ds(encodeURIComponent(topicnameHOSTILE)) + `" >Hot</a> `;
    navheader += `<span class="separator"></span>`;
    navheader += `<a data-vavilon="VVTop" data-vavilon_title="VV0109" value="topd" title="Top posts from the past Day" class="`+(order=='topd'?'filteron':'filteroff')+`" href="#` + action + `?start=0&limit=` + limit + `&order=topd&content=` + content + `&filter=` + filter + `&qaddress=` + qaddress + `&topicname=` + ds(encodeURIComponent(topicnameHOSTILE)) + `" >Top</a> `;
    navheader += `<span class="separator"></span>`;
    navheader += `<a data-vavilon="VV0112" data-vavilon_title="VV0113" value="topw" title="Top posts from the past Week" class="`+(order=='topw'?'filteron':'filteroff')+`" href="#` + action + `?start=0&limit=` + limit + `&order=topw&content=` + content + `&filter=` + filter + `&qaddress=` + qaddress + `&topicname=` + ds(encodeURIComponent(topicnameHOSTILE)) + `" >Week</a> `;
    navheader += `<span class="separator"></span>`;
    navheader += `<a data-vavilon="VV0114" data-vavilon_title="VV0115" value="topm" title="Top posts from the past Month" class="`+(order=='topm'?'filteron':'filteroff')+`" href="#` + action + `?start=0&limit=` + limit + `&order=topm&content=` + content + `&filter=` + filter + `&qaddress=` + qaddress + `&topicname=` + ds(encodeURIComponent(topicnameHOSTILE)) + `" >Month</a> `;
    //navheader += `<span class="separator"></span>`;
    //navheader += `<a data-vavilon="VV0116" data-vavilon_title="VV0117" value="topy" title="Top posts from the past Year" class="`+(order=='topy'?'filteron':'filteroff')+`" href="#` + action + `?start=0&limit=` + limit + `&order=topy&content=` + content + `&filter=` + filter + `&qaddress=` + qaddress + `&topicname=` + ds(encodeURIComponent(topicnameHOSTILE)) + `" >` + getSafeTranslation('new', 'new') + `</a> `;
    navheader += `<span class="separator"></span>`;
    navheader += `<a data-vavilon="VV0118" data-vavilon_title="VV0119" value="topa" title="Top posts from all time" class="`+(order=='topa'?'filteron':'filteroff')+`" href="#` + action + `?start=0&limit=` + limit + `&order=topa&content=` + content + `&filter=` + filter + `&qaddress=` + qaddress + `&topicname=` + ds(encodeURIComponent(topicnameHOSTILE)) + `" >All</a> `;
    navheader += `<span class="separator"></span>`;
    navheader += `<a data-vavilon="VVold" data-vavilon_title="VVoldtitle" value="topa" title="Oldest to newest" class="`+(order=='old'?'filteron':'filteroff')+`" href="#` + action + `?start=0&limit=` + limit + `&order=old&content=` + content + `&filter=` + filter + `&qaddress=` + qaddress + `&topicname=` + ds(encodeURIComponent(topicnameHOSTILE)) + `" >Old</a> `;
    navheader += "</nav>";
    
    navheader += `<nav class="filters filterssecondset">`;
    navheader += `<a data-vavilon="VV0120" data-vavilon_title="VV0121" title="See only posts" class="`+(content=='posts'?'filteron':'filteroff')+`" href="#` + action + `?start=0&limit=` + limit + `&order=` + order + `&content=posts&filter=` + filter + `&qaddress=` + qaddress + `&topicname=` + ds(encodeURIComponent(topicnameHOSTILE)) + `" >Posts</a> `;
    navheader += `<span class="separator"></span>`;
    navheader += `<a data-vavilon="VV0122" data-vavilon_title="VV0123" title="See only replies" class="`+(content=='replies'?'filteron':'filteroff')+`" href="#` + action + `?start=0&limit=` + limit + `&order=` + order + `&content=replies&filter=` + filter + `&qaddress=` + qaddress + `&topicname=` + ds(encodeURIComponent(topicnameHOSTILE)) + `" >Replies</a> `;
    navheader += `<span class="separator"></span>`;
    navheader += `<a data-vavilon="VVall" data-vavilon_title="VV0125" title="See both posts and replies" class="`+(content=='both'?'filteron':'filteroff')+`" href="#` + action + `?start=0&limit=` + limit + `&order=` + order + `&content=both&filter=` + filter + `&qaddress=` + qaddress + `&topicname=` + ds(encodeURIComponent(topicnameHOSTILE)) + `" >All</a> `;
    navheader += "</nav>";

    return navheader;

}

function getNotificationNavButtonsNewHTML(start, limit, action, qaddress, minrating, notificationtype, numberOfResults) {
    //Caution topicname may contain hostile characters/code

    var navbuttons = `<div class="navbuttons">`;

    if (start != 0) //Don't show back buttons if we're at the start
    { navbuttons += `<a class="next" href="#` + action + `?start=` + (Number(start) - Number(numbers.results)) + `&limit=` + limit + `&minrating=` + minrating + `&nfilter=` + notificationtype + `&qaddress=` + qaddress + `" >` + getSafeTranslation('prev', 'back') + `</a> `; }

    if (numberOfResults > numbers.results) //Sometimes an sql limit request returns fewer than the available set - nearly always include a next button
    { navbuttons += `<a class="back" href="#` + action + `?start=` + (Number(start) + Number(numbers.results)) + `&limit=` + limit + `&minrating=` + minrating + `&nfilter=` + notificationtype + `&qaddress=` + qaddress +  `" >` + getSafeTranslation('next', 'next') + `</a>`; }

    navbuttons += "</div>";
    return navbuttons;

}


function getNavButtonsNewHTML(order, content, topicnameHOSTILE, filter, start, limit, action, qaddress, functionName, numberOfResults) {
    //Caution topicname may contain hostile characters/code

    var navbuttons = `<div class="navbuttons">`;

    if (start != 0) //Don't show back buttons if we're at the start
    { navbuttons += `<a class="next" href="#` + action + `?start=` + (Number(start) - Number(numbers.results)) + `&limit=` + limit + `&order=` + order + `&content=` + content + `&filter=` + filter + `&qaddress=` + qaddress + `&topicname=` + ds(encodeURIComponent(topicnameHOSTILE)) + `" >` + getSafeTranslation('prev', 'back') + `</a> `; }

    if (numberOfResults > numbers.results/2) //Sometimes an sql limit request returns fewer than the available set - nearly always include a next button
    { navbuttons += `<a class="back" href="#` + action + `?start=` + (Number(start) + Number(numbers.results)) + `&limit=` + limit + `&order=` + order + `&content=` + content + `&filter=` + filter + `&qaddress=` + qaddress + `&topicname=` + ds(encodeURIComponent(topicnameHOSTILE)) + `" >` + getSafeTranslation('next', 'next') + `</a>`; }

    navbuttons += "</div>";
    return navbuttons;

}


function getItemListandNavButtonsHTML(contentsHTML, navbuttonsHTML, styletype, start) {
    if (styletype != "") {
        return `<div class="itemlist"><ol start="` + (Number(start) + 1) + `" class="` + styletype + `">` + contentsHTML + `</ol></div><div class="navbuttons">` + navbuttonsHTML + `</div>`;
    } else {
        return `<div class="itemlist">` + contentsHTML + `</div><div class="navbuttons">` + navbuttonsHTML + `</div>`;
    }
}

function getVoteButtons(txid, address, likedtxid, likeordislike, score) {

    var upvoteHTML;
    let scoreHTML = `<span class="betweenvotesscore" id="score` + san(txid) + `">` + Number(score) + `</span>`;
    var downvoteHTML;

    if (likeordislike == "1") {
        upvoteHTML = `<a id="upvoteaction` + san(txid) + `" href="javascript:;"><span id="upvote` + san(txid) + `" class="votearrowactivated" title="` + getSafeTranslation('up') + `"></span><span class="votetext">` + getSafeTranslation('up') + `</span></a>`;
        scoreHTML = `<span class="betweenvotesscoreup" id="score` + san(txid) + `">` + Number(score) + `</span>`;
    } else {
        upvoteHTML = `<a id="upvoteaction` + san(txid) + `" href="javascript:;" onclick="likePost('` + san(txid) + `','` + san(address) + `')"><span id="upvote` + san(txid) + `" class="votearrow" title="` + getSafeTranslation('up') + `"></span><span class="votetext">` + getSafeTranslation('up', 'up') + `</span></a>`;
    }

    if (likeordislike == "-1") {
        downvoteHTML = `<a id="downvoteaction` + san(txid) + `" href="javascript:;"><span id="downvote` + san(txid) + `" class="votearrowactivateddown rotate180" title="` + getSafeTranslation('down') + `"><span class="votetext">` + getSafeTranslation('down', 'down') + `</span></span></a>`;
        scoreHTML = `<span class="betweenvotesscoredown" id="score` + san(txid) + `">` + Number(score) + `</span>`;
    } else {
        downvoteHTML = `<a id="downvoteaction` + san(txid) + `" href="javascript:;" onclick="dislikePost('` + san(txid) + `')"><span id="downvote` + san(txid) + `" class="votearrow rotate180" title="` + getSafeTranslation('down') + `"><span class="votetext">` + getSafeTranslation('down', 'down') + `</span></span></a>`;
    }

    return upvoteHTML + " " + scoreHTML + " " + downvoteHTML;
}

function getRefreshButtonHTML() {
    return `<a id="refreshbutton" class="btn" href="" onclick="displayContentBasedOnURLParameters();return false;">🔄</a>`;
}


function completedPostHTML(txid, titleHOSTILE) {

    var encodedURL = `https://twitter.com/intent/tweet?text=` + encodeURIComponent(titleHOSTILE + '\r\n' + ` member.cash/p/` + san(txid.substr(0, 10)));

    var obj = {
        //These must all be HTML safe 
        txid: san(txid),
        encodedurl: encodedURL
    };

    return templateReplace(completedPostTemplate, obj);
}

function getCloseButtonHTML(profileelement) {
    return `<div class='closebutton'><a onclick="document.getElementById('` + profileelement + `').style.display='none';">` + getSafeTranslation('close', 'close') + `</a></div>`;
}

function getTipDetailsHTML(user, amount, type) {
    var theclass="tipdetailscompact";
    return `<div class="`+theclass+`">` + user + (amount > 0 ? ` ` + getSafeTranslation('tipped', 'tipped') + ` ` + balanceString(amount) : ``) + (Number(type) == -1 ? ` ` + getSafeTranslation('disliked', 'disliked') : ``) + `</div>`;
}

function getRememberDetailsHTML(user, message, topic, txid) {
    var theclass="rememberdetailscompact";
    return `<div class="`+theclass+`">` + user + `<span class="plaintext"><a href="#thread?post=` + san(txid) + `" onclick="nlc();">` + (message ? getSafeTranslation('quoteremembered', 'quote remembered') : getSafeTranslation('remembered', 'remembered')) + "</a></span> " + getTopicHTML(topic, getSafeTranslation('totopic', ' #')) + `</div>`;
}

function getRepostHeaderHTML(user) {
    return `<span class='repost'>` + user + ` ` + getSafeTranslation('remembered', 'remembered') + `</span>`;
}

function getProfilePicLargeHTML(theURL) {
    return `<img id="settingspicturelarge" class="settingspicturelarge" src="` + theURL + `" style="display: block;" width="640" height="640">`;
}

function getNoCommentsYetHTML() {
    return `<p data-vavilon="replytostart" class='nocommentsyet'>No comments yet . . . reply to start a conversation</p>`;
}

//Media replacement
function makeYoutubeIframe(youtubeid, starttime) {
    var src = event.srcElement.parentElement.parentElement.parentElement.parentElement;
    //setTimeout(function(){src.innerHTML='<div><br/><iframe class="youtubeiframe" src="https://www.youtube.com/embed/'+san(youtubeid)+'?rel=0&autoplay=1&showinfo=0" frameborder="0"></iframe></div>';},100);
    src.innerHTML = '<iframe width="480" height="270" class="youtubeiframe" src="https://www.youtube.com/embed/' + sanyoutubeid(youtubeid) + '?rel=0&autoplay=1&showinfo=0&start=' + starttime + '" frameborder="0"></iframe>';
}

function addImageAndYoutubeMarkdown(message, differentiator, global) {

    //These links should all have been generated by software, so should have a pattern of <a href=" pattern.

    if (settings["showyoutube"] == "true") {
        //Youtube
        var youtubeRegex = global ?
            /<a (?:rel="noopener noreferrer" )?href="(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/.*?(?:watch|embed)?(?:.*?v=|v\/|\/)([\w\-_]{7,12})(?:[\&\?\#].*?)*?(?:([\&\?\#]t=)?(([\dhms]+))?).*?<\/a>/gi :
            /<a (?:rel="noopener noreferrer" )?href="(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/.*?(?:watch|embed)?(?:.*?v=|v\/|\/)([\w\-_]{7,12})(?:[\&\?\#].*?)*?(?:([\&\?\#]t=)?(([\dhms]+))?).*?<\/a>/i;
        message = message.replace(youtubeRegex,
            `<div class="youtubecontainer"><div class="youtubepreviewimage"><a onclick="event.stopPropagation();makeYoutubeIframe('$1','$4');"><div class="youtubepreview"><img height="270" class="youtubepreviewimage" src="https://img.youtube.com/vi/$1/0.jpg"><img class="play-icon" alt="video post" width="100" src="img/youtubeplaybutton.svg"></div></a></div></div>`
        );
    }

    if (settings["showimgur"] == "true") {
        //Imgur
        var imgurRegex = global ?
            /<a (?:rel="noopener noreferrer" )?href="(?:https?:\/\/)?(\w+\.)?imgur\.com(\/|\/a\/|\/gallery\/)(?!gallery)([\w\-_]{5,12})(\.[a-zA-Z0-9]{3,4})*.*?<\/a>/gi :
            /<a (?:rel="noopener noreferrer" )?href="(?:https?:\/\/)?(\w+\.)?imgur\.com(\/|\/a\/|\/gallery\/)(?!gallery)([\w\-_]{5,12})(\.[a-zA-Z0-9]{3,4})*.*?<\/a>/i;
        message = message.replace(imgurRegex, replaceImgur);
    }

    /*if (settings["showprism"] == "true") {
        //Prism
        //If not, cdn.prism.red/*.jpeg & .png
        //Otherwise include mp4 & mp3 in that extension list
        var imgurRegex = global ?
            /<a (?:rel="noopener noreferrer" )?href="(?:https?:\/\/)?(\w+\.)?imgur\.com(\/|\/a\/|\/gallery\/)(?!gallery)([\w\-_]{5,12})(\.[a-zA-Z0-9]{3,4})*.*?<\/a>/gi :
            /<a (?:rel="noopener noreferrer" )?href="(?:https?:\/\/)?(\w+\.)?imgur\.com(\/|\/a\/|\/gallery\/)(?!gallery)([\w\-_]{5,12})(\.[a-zA-Z0-9]{3,4})*.*?<\/a>/i;
        message = message.replace(imgurRegex, replaceImgur);
    }*/

    if (settings["showtwitter"] == "true") {
        //Twitter
        var tweetRegex = global ?
            /<a (?:rel="noopener noreferrer" )?href="https?:\/\/(?:mobile\.)?twitter\.com\/(?:#!\/)?(\w+)\/status(es)?\/([0-9]{19})*.*?<\/a>/gi :
            /<a (?:rel="noopener noreferrer" )?href="https?:\/\/(?:mobile\.)?twitter\.com\/(?:#!\/)?(\w+)\/status(es)?\/([0-9]{19})*.*?<\/a>/i;
        //This works but is ugly
        //Add differentiator so that if a tweet is shown multiple times, it has a different id each time
        message = message.replace(tweetRegex,
            '<div class="twittercontainer"><iframe  height="400" width="550" class="twitteriframe" id="tweet_$3' + differentiator + '" border=0 frameborder=0  src="https://twitframe.com/show?url=https%3A%2F%2Ftwitter.com%2F$1%2Fstatus%2F$3"></iframe></div>'
        );
    }

    if (settings["showlbry"] == "true") {
        var lbryRegex = global ?
        /<a (?:rel="noopener noreferrer" )?href="(?:https?:\/\/)?lbry\.tv\/@.+\/(.+?(?=:)).*<\/a>/gi :
        /<a (?:rel="noopener noreferrer" )?href="(?:https?:\/\/)?lbry\.tv\/@.+\/(.+?(?=:)).*<\/a>/i;
        message = message.replace(lbryRegex,`<div class="youtubecontainer"><iframe width="480" height="270" class="youtubeiframe" src="https://lbry.tv/$/embed/$1"></iframe></div>`);      
    }

    if (settings["showbitclout"] == "true") {
        //Bitclout
        var bitcloutRegex = global ?
            /<a (?:rel="noopener noreferrer" )?href="(?:https?:\/\/)?images\.bitclout\.com\/([a-zA-Z0-9]{64})(\.[a-zA-Z0-9]{3,4})*.*?<\/a>/gi :
            /<a (?:rel="noopener noreferrer" )?href="(?:https?:\/\/)?images\.bitclout\.com\/([a-zA-Z0-9]{64})(\.[a-zA-Z0-9]{3,4})*.*?<\/a>/i;
        message = message.replace(bitcloutRegex, `<a href="https://images.bitclout.com/$1.webp" rel="noopener noreferrer" target="_bitclout" onclick="event.stopPropagation();"><div class="imgurcontainer"><img class="imgurimage" src="https://images.bitclout.com/$1$2"></img></div></a>`);
    }
    return message;
}

/*
function replaceLBRY(match, p1, p2, p3, p4, offset, string) {
    var differentiator = Math.floor(Math.random() * 1000000);
    populatelbry(p1,'lbry'+differentiator);
    return `<div id="lbry`+differentiator+`" class="youtubecontainer"></div>`;
}

async function populatelbry(lbrylink,elementid){
    //load lbry page
    let response = await fetch("https://lbry.tv/"+lbrylink);
    if (response.ok) { // if HTTP-status is 200-299
        let json = await response.text();
        document.getElementById(elementid).innerHTML=`<iframe width="480" height="270" class="youtubeiframe" src="https://lbry.tv/"></iframe>`;
    } else {
        //alert("HTTP-Error: " + response.status);
    }
    //parse for link
    
    //set contents
    //
}*/

function replaceImgur(match, p1, p2, p3, p4, offset, string) {
    //return p1 + `<a href="#member?pagingid=` + encodeURIComponent(p2) + `" onclick="nlc();">@` + ds(p2) + `</a>`;
    if (!p4) { p4 = '.jpg'; }
    if (p4.toLowerCase() == '.mp4') {
        return `<a href='javascript:;'><video controls class="imgurimage" draggable="false" playsinline="true" loop="true"><source type="video/mp4" src="https://i.imgur.com` + p2 + p3 + p4 + `" alt="imgur post ` + p2 + `"></video></a>`;
    }

    return `<a href="https://i.imgur.com` + p2 + p3 + `" rel="noopener noreferrer" target="_imgur" onclick="event.stopPropagation();"><div class="imgurcontainer"><img class="imgurimage" src="https://i.imgur.com` + p2 + p3 + p4 + `" alt="imgur post ` + p2 + `"></img></div></a>`;
}

//Notifications

function allowNotificationButtonHTML() {
    return `<span class="allownotifications"><a data-vavilon="VV0080" class="notificationbutton" href="javascript:;" onclick="requestNotificationPermission(); this.style.display='none';">Allow Notifications</a></span>`;
}

function getNotificationsTableHTML(contents, navbuttons) {
    return `<ul class="notificationslist">` + contents + `</ul>` + navbuttons;
}

function notificationItemHTML(notificationtype, iconHTML, mainbodyHTML, subtextHTML, addendumHTML, txid, highlighted) {
    //icon, mainbody and subtext should already be escaped and HTML formatted

    var obj = {
        //These must all be HTML safe.
        highlighted: (highlighted ? 'highlighted ' : ''),
        type: notificationtype,
        txid: san(txid),
        title: mainbodyHTML,
        age: subtextHTML,
        post: addendumHTML,
        iconHTML: iconHTML
    }

        return templateReplace(notificationCompactTemplate, obj);
    

    /*return `
    <li class="`+ (highlighted ? 'highlighted ' : '') + `notificationitem notification` + san(notificationtype) + `" id='notification` + san(txid) + `'>
        <div class="notificationdetails">
        <div class="notificationminheight">
            <div class="notificationtitle">`+
        mainbodyHTML + `
                <span class="age">` + subtextHTML + `</span>
            </div>`+
        addendumHTML +
        `</div><hr class="notificationhr"/>
        </div>       
    </li>`;*/
}



//Maps

function getMapPostHTML(lat, lng, requireLogin) {

    var obj = {
        //These must all be HTML safe.
        lat: Number(lat),
        lng: Number(lng),
        profilepicsmall:profilepic,
        address:pubkey
    }

        return templateReplace(mapPostTemplate, obj);

}

function getMapCloseButtonHTML() {
    return `<font size="+3"><a href="#posts?type=all&amp;start=0&amp;limit=` + numbers.results + `">X</a></font>`;
    //onclick="hideMap();showPosts(0,numbers.results,'all');"
}

function getOSMattributionHTML() {
    return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors.';
}

function mapThreadLoadingHTML(previewHTML) {
    return `<div id='mapthread'>` + getSafeTranslation('loading', 'loading ') + previewHTML + "</div>";
}

//Trust graph and Rating
function getMembersWithRatingHTML(i, page, data, action, reverse) {
    var directlink="";
    var field1 = `<td>` + directlink + userFromDataBasic(data, i + page + data.address, 8) + `</td>`;
    var field2 = `<td>` + getMemberLink(data.address2, data.name2) + `</td>`;
    if (reverse) {
        return `<tr>` + field2 + `<td>` + action + `</td>` + field1 + `</tr>`;
    }
    return `<tr>` + field1 + `<td>` + action + `</td>` + field2 + `</tr>`;
}

function getMemberLink(address, name) {
    return `<a href="#member?qaddress=` + san(address) + `" onclick="nlc();">` + ds(name) + `</a>`;
}

function getAddressLink(address, name) {
    return `<a href="#member?qaddress=` + san(address) + `" onclick="nlc();">` + san(address) + `</a>`;
}

function getDirectRatingHTML(data) {
    var obj = {
        //These must all be HTML safe.
        member: getMemberLink(data.member, data.membername),
        memberid: san(data.member),
        target: san(data.target),
        targetid: getMemberLink(data.target, data.targetname)
    }

    return templateReplace(directRatingHTML, obj);

    //return "<tr><td data-label='Member'>" + getMemberLink(data.member, data.membername) + "</td>" + "<td></td><td></td><td data-label='Rates as' align='center'> <div id='trust" + san(data.member) + san(data.target) + "'></div>  </td><td></td><td></td>" + "<td align='center'>" + "<td data-label='Member'>" + getMemberLink(data.target, data.targetname) + "</td></tr>";
}

function getIndirectRatingHTML(data) {
    var obj = {
        //These must all be HTML safe.
        member: getMemberLink(data.member, data.membername),
        memberid: san(data.member),
        inter: getMemberLink(data.inter, data.intername),
        interid: san(data.inter),
        target: getMemberLink(data.target, data.targetname),
        targetid: san(data.target)
    }

    return templateReplace(indirectRatingHTML, obj);

    //return "<tr><td data-label='You'><span class='ratermember'>" + getMemberLink(data.member, data.membername) + "</span></td>" + "<td data-label='Rate as'><span class='trustratingintermediate'><div id='trust" + san(data.member) + san(data.inter) + "'></div></span></td>" + "<td align='center' data-label='Member'><span class='intermediatemember'>" + getMemberLink(data.inter, data.intername) + "</span></td>" + `<td data-label='Who Rates as'><span class='trustratingbyintermediate'><div id='trust` + san(data.inter) + san(data.target) + "'></div></span></td>" + "<td data-label='Member'><span class='ratedmember'>" + getMemberLink(data.target, data.targetname) + "</span></td></tr>";
}

function getTrustRatingTableHTML(contentsHTML, rating) {

    var obj = {
        //These must all be HTML safe.
        tablecontents: contentsHTML,
        rating: (rating == 0) ? "No information" : Number(rating)
    }

    return templateReplace(trustRatingTableHTML, obj);

    /*if (rating == 0) {
        return "<span style='font-size:2em'>Overall Rating: No information</span><div id='overall'></div><br/><br/><table>" + contentsHTML + "</table>";
    } else {
        return "<span style='font-size:2em'>Overall Rating:" + Number(rating) + "/5</span><div id='overall'></div><br/><br/><table>" + contentsHTML + "</table>";
    }*/
}

function ratingAndReasonNew(ratername, rateraddress, rateename, rateeaddress, rating, reason, stem, txid) {
    //Careful to ensure disabletext is sanitized
    var disableText = rts(ratername) + ' rates ' + rts(rateename) + ' as {rating}/{maxRating}';

    var obj = {
        //These must all be HTML safe.
        rater: getMemberLink(rateraddress, ratername),
        disabletext: disableText,
        rateraddress: san(rateraddress),
        rating: Number(rating),
        stem: stem,
        ratee: getMemberLink(rateeaddress, rateename),
        txid: san(txid),
        reason: ds(reason)
    }

    return templateReplace(ratingAndReasonHTML, obj);


    //return "<tr><td data-label='Member'>" + getMemberLink(rateraddress, ratername) + `</td><td data-label='Rates As' align='center'> <div data-disabledtext="` + disableText + `" data-ratingsize="24" data-ratingaddress="` + san(rateraddress) + `" data-ratingraw="` + Number(rating) + `" id='` + stem + `` + san(rateraddress) + "'></div>  </td><td data-label='Member'>" + getMemberLink(rateeaddress, rateename) + "</td></tr> <tr><td></td><td data-label='Commenting...' colspan='2'><a href='#thread?root=" + san(txid) + "'>" + ds(reason) + "</a></td></tr>";
}

function getRatingComment(qaddress, data) {
    return `<input placeholder="`+getSafeTranslation('VVratinginstruction', 'Add a comment and click on a star rating to rate this member...')+`" size="30" maxlength="190" id="memberratingcommentinputbox` + san(qaddress) + `" value="` + (data.length > 0 ? ds(data[0].ratingreason) : "") + `" onkeypress="this.onchange();" onpaste="this.onchange();" oninput="this.onchange();"></input>`;
}

function getMemberRatingHTML(qaddress, ratingScore, pagingid) {
    return `<div class="starrating"><div data-ratingsize="20" data-ratingname="`+ds(pagingid)+`" data-ratingaddress="` + san(qaddress) + `" data-ratingraw="` + Number(ratingScore) + `" id="memberrating` + san(qaddress) + `"></div></div>`;
}


//Settings
function clickActionNamedHTML(action, qaddress, name, targetpubkey) {
    return `<a data-vavilon='`+action+`' class='` + action + `' href='javascript:;' onclick='` + action + `("` + unicodeEscape(qaddress) + `","` + unicodeEscape(targetpubkey) + `"); this.style.display="none";'>` + ds(name) + `</a>`;
}

/*
function privatekeyClickToShowHTML() {
    return `<a id="privatekeyclicktoshow" onclick="document.getElementById('privatekeydisplay').style.display='block';document.getElementById('privatekeyclicktoshow').style.display='none';">` + getSafeTranslation('showpriv', 'Show private key') + `</a>`;
}*/

//Topics
function clickActionTopicHTML(action, qaddress, topicHOSTILE, buttonText, elementid) {
    return `<a id='` + san(elementid) + `' href='javascript:;' onclick='` + action + `("` + unicodeEscape(qaddress) + `","` + unicodeEscape(topicHOSTILE) + `","` + san(elementid) + `");'>` + ds(buttonText) + `</a>`;
}

function getTopicHTML(topicHOSTILE, append) {
    //If the topic is All Topics, keep that as the display name, but use the empty string for server
    var displayNameHOSTILE = topicHOSTILE;
    if (topicHOSTILE == '') {
        if (append != '') return '';
        displayNameHOSTILE = 'All Tags';
    }
    return ` <span class="topic">` +
        `<a href="#topic?topicname=` + encodeURIComponent(topicHOSTILE) + `&start=0&limit=` + numbers.results + `&order=new" onclick="nlc();"> #` + capitalizeFirstLetter(ds(displayNameHOSTILE).substr(0, 40)) + `</a>`
        + `</span>`;
}

function getHTMLForTopicArray(data, elementStem) {

    var ret = getHTMLForTopic(data[0], elementStem);

    //This line so the alternate coloring on table rows still works
    ret += "<tr style='display:none'></tr>";

    ret += `<tr style='display:none' id='` + elementStem + data[0].mostrecent + `'><td colspan='4'>`;
    if (data[0].topic != "") {
        ret += `<div class="filterprovider">` + clickActionNamedHTML("unsub", data[0].topic, getSafeTranslation('unsubscribe', 'unsubscribe')) + "</div>";
    }
    var alreadymod = false;
    for (var i = 0; i < data.length; i++) {
        if (data[i].existingmod == pubkey) {
            ret += `<div class="filterprovider">` + clickActionTopicHTML("dismiss", pubkey, data[i].topicname, getSafeTranslation('resign', 'resign as moderator'), "dismiss" + Number(data[i].mostrecent)) + "</div>";
            alreadymod = true;
        }
    }
    if (!alreadymod) {
        ret += `<div class="filterprovider">` + clickActionTopicHTML("designate", pubkey, data[0].topicname, getSafeTranslation('volunteer', 'volunteer as moderator'), "designate" + Number(data[0].mostrecent)) + "</div>";
    }

    for (var i = 0; i < data.length; i++) {
        if (data[i].existingmod == pubkey) continue;
        if (data[i].existingmod != null) {
            if (data[i].existingmodaddress != null) {
                ret += `<div class="filterprovider">` + clickActionTopicHTML("dismiss", data[i].existingmod, data[i].topicname, getSafeTranslation('removefilter', 'remove filter'), "dismiss" + data[i].existingmod + Number(data[i].mostrecent)) + "<span class='mib'>( " + userHTML(data[i].existingmod, data[i].existingmodname, "", "", 0) + ")</span></div>";
            } else {
                var userName="";
                try{
                    userName = document.getElementById('settingsnametext').value;
                }catch(err){}//means user is not logged in
                var userIsGroupFilter = userName.toLowerCase().endsWith("filter") || userName.toLowerCase().endsWith("group");
                if(!data[i].existingmodname)data[i].existingmodname="";
                var modIsGroupFilter = data[i].existingmodname.toLowerCase().endsWith("filter") || data[i].existingmodname.toLowerCase().endsWith("group");
                if (userIsGroupFilter != modIsGroupFilter) {
                    ret += `<div class="filterprovider">` + clickActionTopicHTML("designate", data[i].existingmod, data[i].topicname, getSafeTranslation('addfilter', 'add filter'), "designate" + data[i].existingmod + Number(data[i].mostrecent)) + "<span class='mib'>( " + userHTML(data[i].existingmod, data[i].existingmodname, "", "", 0) + ")</span></div>";
                }
            }
        }
    }
    ret += "</td></tr>";
    return ret;
}

function getHTMLForTopic(data, elementStem) {
    var ret = "";
    var subscribe = clickActionNamedHTML("sub", data.topicname, "sub");

    //Show more button if the user is subscribed or topic is emtpy string
    if (data.address != null || data.topicname == "") {
        subscribe = `<a id="` + elementStem + `link` + data.mostrecent + `" onclick="showMore('` + elementStem + data.mostrecent + `','` + elementStem + `link` + data.mostrecent + `'); jdenticon();" href="javascript:;">` + getSafeTranslation('more', 'more') + `</a>`;
    }
    //Special values for empty topic
    if (data.topicname == "") {
        data.messagescount = "";
        data.subscount = "";
    }
    ret += "<tr><td class='tltopicname'>" + getTopicHTML(data.topicname, '') + "</td><td class='tlmessagecount'>" + Number(data.messagescount) + "</td><td class='tlsubscount'>" + Number(data.subscount) + "</td><td class='tlaction'>" + subscribe + "</td></tr>";
    return ret;

}

function getHTMLForTopicHeader(topicNameHOSTILE, contents) {

    var obj = {
        //These must all be HTML safe.
        topic: capitalizeFirstLetter(ds(topicNameHOSTILE)),
        tablecontents: contents
    }

    return templateReplace(topicHeaderHTML, obj);

    /*return "<div class='content'><h1 class='topicheader'>" + capitalizeFirstLetter(ds(topicNameHOSTILE)) + "</h1><table><thead><tr><td class='tltopicname'>Topic</td><td class='tlmessagescount'>Posts</td><td class='tlsubscount'>Subs</td><td class='tlaction'>Action</td></tr></thead><tbody>"
        + contents
        + "</tbody></table></div>";
        */
}

//Private Messages
function sendEncryptedMessageHTML(address, name, publickey) {
    return ` <a class="populate-send-message" onclick="populateSendMessage('` + san(address) + `','` + unicodeEscape(name) + `','` + san(publickey) + `');" href='javascript:;'>` + getSafeTranslation('sendmessage', 'send message') + `</a>`;
}

function populateSendMessage(address, name, publickey) {
    //show('messagesanchor');
    location.href = "#messages";

    if (publickey == null || publickey == "") {
        alert(getSafeTranslation('publickeynotavailable', "Public key is not available - maybe the user hasn't set their name/handle."));
        return;
    }
    document.getElementById('sendmessagebox').style.display = 'block';
    document.getElementById('messagerecipient').textContent = name;
    document.getElementById('messageaddress').textContent = address;
    document.getElementById('messagepublickey').textContent = publickey;
    scrollToElement("sendmessagecontainer");
}

function getMessageHTML(data, count) {
    var contents = "";
    // Decrypt the message
    if (data.address == pubkey && data.address != data.toaddress) {
        //this message was sent by the logged in user.
        //we can't decrypt it, just make a note of the reply
        if (!data.recipientname) {
            data.recipientname = data.recipient;
            //should be possible to remove this after a month or so
        }
        //You sent a message
        contents += "<li><div class='replymessagemeta'><span class='plaintext'>" + getSafeTranslation('yousent', 'you sent') + " (" + data.message.length + " bytes) -> </span>" + userHTML(data.toaddress, data.recipientname, count + "privatemessages" + data.toaddress, data.recipientrating, 0, data.recipientpagingid, data.recipientpublickey, data.recipientpicurl, data.recipienttokens, data.recipientfollowers, data.recipientfollowing, data.recipientblockers, data.recipientblocking, data.recipientprofile, data.recipientisfollowing, data.recipientnametime, true, data.recipientlastactive, data.recipientsysrating) + " " + getAgeHTML(data.firstseen, false) + " " + sendEncryptedMessageHTML(data.toaddress, data.recipientname, data.recipientpublickey) + "</div></li>";
    } else {
        decryptMessageAndPlaceInDiv(privateKeyBuf, data.message, data.roottxid, data.publickey);
        contents += "<li><span class='messagemeta'>" + userFromDataBasic(data, count + "privatemessages" + data.address, 16) + " " + getAgeHTML(data.firstseen, false) + " " + sendEncryptedMessageHTML(data.address, data.name, data.publickey) + "</span><br/><div class='privatemessagetext' id='" + san(data.roottxid) + "'>" + getSafeTranslation('processing', 'processing') + "</div><br/></li>";
    }
    return contents;
}

var bcdecrypt=null;

async function decryptMessageAndPlaceInDiv(privateKeyBuf, message, roottxid, publicKeySender) {
    //const privateKeyBuf5 = wif.decode(privkey).privateKey;

    //"Try again later: Unable to decrypt message: "
    var decryptedMessage = getSafeTranslation('unabledecrypt', "Try again later: Unable to decrypt message: ");
    try {

        /*try{
            //Bitclout message style - do not remove, this can be used to decrypt messages with priv key
            if(bcdecrypt==null){
                await loadScript("js/lib/bcdecrypt.js");
            }
            var msgArray=new BCBuffer(message.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
            // I swear this buffer has the same information as when BC decrypts it correctly - seems to object to
            // the buffer format in some way. Maybe need to use the bc library buffer type.
            decryptedMessage=await bcdecrypt(privateKeyBuf,msgArray);
            
            //decryptedMessage=await bitcloutDecryptMessage(message);
            return;

        }catch(err2){
            //Member message style
            const encrypted = eccryptoJs.deserialize(Buffer.from(message, 'hex'));
            const structuredEj = await eccryptoJs.decrypt(privateKeyBuf, encrypted);
            decryptedMessage = structuredEj.toString();
        }*/

        if(isBitCloutUser()){
            if(isBitCloutIdentityUser()){
                putBitCloutDecryptedMessageInElement(message,roottxid,publicKeySender);
            }else if(privateKeyBuf){
                try{
                    //Bitclout message style - 
                    if(bcdecrypt==null){
                        await loadScript("js/lib/bcdecrypt.js");
                    }
                    var msgArray=new BCBuffer(message.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
                    decryptedMessage=await bcdecrypt(privateKeyBuf,msgArray);   
                    document.getElementById(roottxid).textContent = decryptedMessage;
                }catch(err2){
                    console.log(err2);
                }
            }
            return;
        }else if(privkey){
            //Member message style
            const encrypted = eccryptoJs.deserialize(Buffer.from(message, 'hex'));
            const structuredEj = await eccryptoJs.decrypt(privateKeyBuf, encrypted);
            decryptedMessage = structuredEj.toString();
        }else{
            decryptedMessage = getSafeTranslation('logintodecrypt', "Login to decrypt message: ");
        }
    } catch (err) {
        decryptedMessage += err;
        console.log(err);
        await sleep(500);
    }
    //decryptedMessage = decryptedMessage.replace(/(?:\r\n|\r|\n)/g, '<br>');
    //decrypted message can contain anything - don't do anything fancy with it - js/css risk!
    document.getElementById(roottxid).textContent = decryptedMessage;
}


/*function getNothingFoundMessageHTML(tk, def) {
    return "<div class='message'>" + getSafeTranslation(tk, def) + "</div>";
}*/

function ___i18n(translationKey) {
    if (dictionary.live[translationKey]) {
        return dictionary.live[translationKey];
    }
    //console.log("No translation for "+translationKey);
    if (dictionary.fallback[translationKey]) {
        return dictionary.fallback[translationKey];
    }
    //console.log("No fallback translation for "+translationKey);
    return translationKey;
    
}

function getSafeTranslation(translationKey, fallback) {
    //return 'x';
    var translated = ___i18n(translationKey);
    if (translated == translationKey && fallback) {
        translated = fallback;
    }
    return ds(translated);
}

function getUnSafeTranslation(translationKey, fallback) {
    //return 'x';
    var translated = ___i18n(translationKey);
    if (translated == translationKey && fallback) {
        translated = fallback;
    }
    return (translated);
}

function translatePage() {
    //var matches = document.getElementsByTagName("*");
    var matches = document.querySelectorAll('[data-vavilon],[data-vavilon_title],[data-vavilon_value],[data-vavilon_data_label],[data-vavilon_data_placeholder]');
    //document.body.style.display='none';
    for (var j = 0; j < matches.length; j++) {
        var fds=matches[j].dataset;
        //if (fds.vavilon || fds.vavilon_title || fds.vavilon_value || fds.vavilon_data_label) {
            if (fds.vavilon) 
                //matches[j].innerHTML=getSafeTranslation(fds.vavilon,fds.vavilon); //nb setting innerText is *a lot* faster
                //matches[j].innerText=getUnSafeTranslation(fds.vavilon,matches[j].innerText); //nb textContent is *even* faster - doesn't cause reflow problems
                matches[j].textContent=getUnSafeTranslation(fds.vavilon,matches[j].textContent);
            if (fds.vavilon_title) 
                matches[j].title=getSafeTranslation(fds.vavilon_title,matches[j].title);
            if (fds.vavilon_value)
                matches[j].value=getSafeTranslation(fds.vavilon_value,matches[j].value);
            if (fds.vavilon_data_label) 
                fds.label=getSafeTranslation(fds.vavilon_data_label,fds.label);
            if (fds.vavilon_data_placeholder) 
                fds.placeholder=getSafeTranslation(fds.vavilon_data_placeholder,fds.placeholder);
                
        //}
    }
    //document.body.style.display='block';
}

//nb iframe not allowed by twitter
/*function createiframe(url, elementname) {
    document.getElementById(elementname).innerHTML = `<iframe height="400" width="550" id="alsotweet" border=0 frameborder=0 src="` + url + `"></iframe>`;
}*/

//Error

function showErrorMessage(status, page, theURL) {
    status = san(status);
    console.log(`Error:${status}`);
    var theElement = document.getElementById(page);
    if (theElement) {
        var obj = {
            //These must all be HTML safe.
            status: ds(status),
            url: ds(theURL)
        }
        theElement.innerHTML = templateReplace(errorTemplate, obj);
        //theElement.innerHTML = `<p><span class='connectionerror'>Oops. This request failed.<br/>There may be a problem with your internet connection, or the server may be having problems.<br/>The error code is ${status}<br/>The resource was ` + ds(theURL) + `</span></p>`;
    }
    updateStatus(`Error:${status}` + ds(theURL));
    updateStatus(`Error:${status}`);
}

//General
function getDivClassHTML(className, contentsHTML) {
    return `<div class="` + className + `">` + contentsHTML + `</div>`;
}

function getSpanHTML(className, localstrid, fallbacktext) {
    return ` <span class="` + className + `">` + getSafeTranslation(localstrid, fallbacktext) + `</span> `;
}

function getSpanClassHTML(className, contentsHTML) {
    return ` <span class="` + className + `">` + contentsHTML + `</span> `;
}

function escapeHTML(thetext) {
    return ds(thetext);
}

function rts(thetext) {
    //Sanitize text in ratings disabled mouseover. This is probably overkill
    return san(thetext);
}
