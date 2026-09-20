import unittest

from app.config import settings


class LocalDefaultsTest(unittest.TestCase):
    def test_database_defaults_to_sqlite_for_local_dev(self):
        self.assertTrue(settings.database_url.startswith('sqlite'))


if __name__ == '__main__':
    unittest.main()
