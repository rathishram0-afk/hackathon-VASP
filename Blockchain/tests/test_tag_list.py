from Blockchain.tag_list import load_tag_list, lookup_address, tag_list_stats


def test_tag_list_loads_real_bundled_tagpacks():
    lookup = load_tag_list()
    assert len(lookup) > 1000  # bundled GraphSense packs cover 3.5k+ BTC addresses


def test_tag_list_stats_breaks_down_by_exchange():
    stats = tag_list_stats()
    assert stats["total_addresses"] == len(load_tag_list())
    assert "bitmex" in stats["by_exchange"]


def test_lookup_known_address_returns_tag():
    lookup = load_tag_list()
    known_address = next(iter(lookup))
    tag = lookup_address(known_address)
    assert tag is not None
    assert tag.address == known_address


def test_lookup_unknown_address_returns_none():
    assert lookup_address("not_a_real_btc_address") is None
