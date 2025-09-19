const BaseRepository = require('./BaseRepository');

class ReportRepository extends BaseRepository {
  constructor({ pool, cache }) {
    super({ pool, cache, table: 'reports' });
  }
}

module.exports = ReportRepository;
