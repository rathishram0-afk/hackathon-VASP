import networkx as nx

from Backend.app.mixer import detect_mixer_nodes, path_crosses_mixer


def test_tumbler_fanout_pattern_is_flagged():
    graph = nx.DiGraph()
    graph.add_edge("src", "mixer1", value_btc=1.0, timestamp=1000)
    for i in range(8):
        graph.add_edge("mixer1", f"out{i}", value_btc=0.1 + (0.0002 * i), timestamp=1000 + i * 30)

    flags = detect_mixer_nodes(graph)

    assert "mixer1" in flags
    assert flags["mixer1"].fanout == 8
    assert flags["mixer1"].equal_value_ratio > 0.5
    assert flags["mixer1"].rapid_succession is True


def test_ordinary_low_fanout_node_is_not_flagged():
    graph = nx.DiGraph()
    graph.add_edge("src", "wallet1", value_btc=1.0, timestamp=1000)
    graph.add_edge("wallet1", "dst1", value_btc=0.7, timestamp=1000)
    graph.add_edge("wallet1", "dst2", value_btc=0.3, timestamp=2_000_000)

    flags = detect_mixer_nodes(graph)

    assert "wallet1" not in flags


def test_high_fanout_with_varied_values_and_slow_timing_is_not_flagged():
    graph = nx.DiGraph()
    for i in range(8):
        # widely varied values, spread over days -- not tumbler-like despite high fan-out
        graph.add_edge("wallet1", f"out{i}", value_btc=0.01 * (i + 1) ** 2, timestamp=1000 + i * 86400)

    flags = detect_mixer_nodes(graph)

    assert "wallet1" not in flags


def test_path_crosses_mixer():
    flags = {"mixer1": object()}
    assert path_crosses_mixer(["src", "mixer1", "dst"], flags) is True
    assert path_crosses_mixer(["src", "clean", "dst"], flags) is False
