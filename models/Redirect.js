const urlKeyPrefix = 'url_';
const clicksKeyPrefix = 'clicks_';

const createResponseObject = (key, url, clicks) => ({ key, url, clicks });

const redisResponseToObject = (key, a, b) => {
  const [, resultUrl] = a;
  const [, resultClicks] = b;
  if (resultUrl && resultClicks) return createResponseObject(key, resultUrl, resultClicks);
  return false;
};

const baseKey = (key, prefix) => key.substring(prefix.length);

module.exports = (redis) => {
  const Redirect = {};

  Redirect.get = (k, callback) => {
    const key = decodeURIComponent(k.toLowerCase()).replace(/[^a-z0-9_]/g, '-');
    redis.multi({ pipeline: false });
    redis.get(urlKeyPrefix + key);
    redis.get(clicksKeyPrefix + key);
    redis.incr(clicksKeyPrefix + key);
    redis.exec((err, result) => {
      if (err) return callback(err);
      return callback(false, redisResponseToObject(key, result[0], result[1]));
    });
  };

  Redirect.create = (k, url, callback) => {
    const key = decodeURIComponent(k.toLowerCase()).replace(/[^a-z0-9_]/g, '-');
    redis.multi({ pipeline: false });
    redis.set(urlKeyPrefix + key, url);
    redis.set(clicksKeyPrefix + key, 0);
    redis.exec((err) => {
      if (err) {
        callback(err);
        return;
      }
      callback(false, createResponseObject(key, url, 0));
    });
  };

  Redirect.delete = (k, callback) => {
    const key = decodeURIComponent(k.toLowerCase()).replace(/[^a-z0-9_]/g, '-');
    redis.del(urlKeyPrefix + key, clicksKeyPrefix + key, (err) => {
      if (err) {
        callback(err);
        return;
      }
      callback(!!err);
    });
  };

  Redirect.getAll = (callback) => {
    redis.keys(`${urlKeyPrefix}*`, (keysError, keys) => {
      if (keysError) return callback(keysError);
      redis.multi({ pipeline: false });
      keys.forEach((element) => {
        const key = baseKey(element, urlKeyPrefix);
        redis.get(urlKeyPrefix + key);
        redis.get(clicksKeyPrefix + key);
      });
      return redis.exec((err, results) => {
        if (err) {
          callback(err);
          return;
        }
        const resultArray = [];
        for (let i = 0; i < keys.length; i += 1) {
          const key = baseKey(keys[i], urlKeyPrefix);
          resultArray.push(
            redisResponseToObject(key, results[2 * i], results[2 * i + 1]),
          );
        }
        resultArray.sort((a, b) => a.key.localeCompare(b.key));
        callback(false, resultArray);
      });
    });
  };

  return Redirect;
};
