const uid = (length, s) => {
    s += Math.random().toString(36).substring(2);
    if(s.length < length){
        return uid(length, s);
    }
    return s.slice(0,length);
}

export {
    uid
}

